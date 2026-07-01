# Quint agent skills

This folder contains [Agent Skills](https://github.com/anthropics/skills) for writing and reasoning about Quint specifications: a language reference (`quint-lang`) and a modeling guide (`quint-modeling`) for authoring `.qnt` files.

The skills use the open `SKILL.md` format and work across agents that support it, including GitHub Copilot, Claude Code, Cursor, OpenAI Codex CLI, and Gemini CLI.

## Installing via the GitHub CLI

Requires the [GitHub CLI](https://cli.github.com) `v2.90.0` or newer. Installs the skills into any supported agent:

```
gh skill install quint-co/quint --all --pin main
```

The command prompts for:

- the target agent (Copilot, Claude Code, Cursor, Codex, or Gemini)
- the installation scope (global or project)

To install a single skill, name it instead of passing `--all`:

```
gh skill install quint-co/quint quint-lang --pin main
```

## Installing via Claude Code plugin

In Claude Code, add the Quint organization to the marketplace and install the plugin:

```
/plugin marketplace add quint-co/quint
/plugin install quint@quint
```

## Installing manually

For setups without the GitHub CLI, the `install.sh` script installs the skills for a chosen agent:

```
curl -fsSL https://raw.githubusercontent.com/quint-co/quint/main/skills/install.sh | bash -s -- <agent> [options]
```

```
Arguments:
  <agent>   Target agent: claude, cursor, codex, or gemini

Options:
  --user    Install into the home directory instead of the current project (default: project)
  --force   Overwrite an existing skill of the same name
```

If the Quint repository is already cloned, run the script directly from its root:

```
./skills/install.sh <agent> [options]
```
