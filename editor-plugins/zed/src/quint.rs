use std::{env, fs};

use zed_extension_api::settings::LspSettings;
use zed_extension_api::{self as zed, Result};

// Published by `vscode/quint-vscode/server`; also used by the Emacs and Vim
// integrations under `editor-plugins/`.
const PACKAGE_NAME: &str = "@informalsystems/quint-language-server";
const SERVER_PATH: &str = "node_modules/@informalsystems/quint-language-server/out/src/server.js";

struct QuintExtension {
    did_find_server: bool,
}

impl QuintExtension {
    fn server_exists(&self) -> bool {
        fs::metadata(SERVER_PATH).is_ok_and(|stat| stat.is_file())
    }

    /// Downloads `quint-language-server` via npm into the extension's work
    /// directory and returns the path to its entry point, installing/updating
    /// it only when needed.
    fn install_and_get_server_path(
        &mut self,
        language_server_id: &zed::LanguageServerId,
    ) -> Result<String> {
        let server_exists = self.server_exists();
        if self.did_find_server && server_exists {
            return Ok(SERVER_PATH.to_string());
        }

        zed::set_language_server_installation_status(
            language_server_id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );
        let version = zed::npm_package_latest_version(PACKAGE_NAME)?;

        if !server_exists
            || zed::npm_package_installed_version(PACKAGE_NAME)?.as_deref()
                != Some(version.as_str())
        {
            zed::set_language_server_installation_status(
                language_server_id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );
            let result = zed::npm_install_package(PACKAGE_NAME, &version);
            match result {
                Ok(()) => {
                    if !self.server_exists() {
                        Err(format!(
                            "installed package '{PACKAGE_NAME}' did not contain expected path '{SERVER_PATH}'",
                        ))?;
                    }
                }
                Err(error) => {
                    if !self.server_exists() {
                        Err(error)?;
                    }
                }
            }
        }

        self.did_find_server = true;
        Ok(SERVER_PATH.to_string())
    }
}

impl zed::Extension for QuintExtension {
    fn new() -> Self {
        Self {
            did_find_server: false,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        // 1. An explicit `lsp.quint-language-server.binary` override in Zed
        //    settings always wins.
        let binary_settings = LspSettings::for_worktree("quint", worktree)
            .ok()
            .and_then(|lsp_settings| lsp_settings.binary);
        if let Some(path) = binary_settings
            .as_ref()
            .and_then(|binary| binary.path.clone())
        {
            return Ok(zed::Command {
                command: path,
                args: binary_settings
                    .and_then(|binary| binary.arguments)
                    .unwrap_or_else(|| vec!["--stdio".to_string()]),
                env: Default::default(),
            });
        }

        // 2. Prefer a `quint-language-server` already on PATH -- covers both
        //    a global `npm i -g` and the `npm link` workflow documented in
        //    CONTRIBUTING.md for local development.
        if let Some(path) = worktree.which("quint-language-server") {
            return Ok(zed::Command {
                command: path,
                args: vec!["--stdio".to_string()],
                env: Default::default(),
            });
        }

        // 3. Fall back to installing the server ourselves via npm.
        let server_path = self.install_and_get_server_path(language_server_id)?;
        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![
                env::current_dir()
                    .unwrap()
                    .join(&server_path)
                    .to_string_lossy()
                    .to_string(),
                "--stdio".to_string(),
            ],
            env: Default::default(),
        })
    }

    fn language_server_initialization_options(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        Ok(LspSettings::for_worktree("quint", worktree)
            .ok()
            .and_then(|lsp_settings| lsp_settings.initialization_options))
    }

    fn language_server_workspace_configuration(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        Ok(LspSettings::for_worktree("quint", worktree)
            .ok()
            .and_then(|lsp_settings| lsp_settings.settings))
    }
}

zed::register_extension!(QuintExtension);
