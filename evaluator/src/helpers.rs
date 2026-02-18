//! Helpers to be used in development environment.
//!
//! It's easier to test and benchmark things using Rust as an entrypoint. We
//! still rely on the Quint typescript tool for parsing, name resolution and
//! type/effect checking, but we can use the `compile` command to get Quint to
//! produce a JSON with what we need and than evaluate from there. This module takes care of that.
//!
//! Quint users should never need this as they use the Typescript tooling as an
//! entrypoint, which calls Rust with all the pre-processing already done.

use crate::ir::OpDef;
use crate::ir::{QuintDeclaration, QuintOutput};
use crate::simulator::ParsedQuint;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::process::Command;
use std::{error::Error, io::Write};
use tempfile::NamedTempFile;

pub fn parse(
    quint_content: &str,
    init: &str,
    step: &str,
    inv: Option<&str>,
) -> Result<QuintOutput, Box<dyn Error>> {
    let mut temp_file = NamedTempFile::new()?;
    temp_file.write_all(quint_content.as_bytes())?;

    let output = Command::new("quint")
        .arg("compile")
        .arg(temp_file.path())
        .args(["--init", init])
        .args(["--step", step])
        .args(["--invariant", inv.unwrap_or("true")])
        .args(["--flatten", "false"])
        .output()?;

    if !output.status.success() {
        return Err(format!(
            "Quint compilation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )
        .into());
    }

    let serialized_quint = String::from_utf8(output.stdout)?;
    let jd = &mut serde_json::Deserializer::from_str(serialized_quint.as_str());
    let output: QuintOutput = serde_path_to_error::deserialize(jd).unwrap();

    Ok(output)
}

pub fn parse_from_path(
    file_path: &Path,
    init: &str,
    step: &str,
    inv: Option<&str>,
    main: Option<&str>,
) -> Result<ParsedQuint, Box<dyn Error>> {
    let dir = tempfile::tempdir()?;
    let file_name = dir.path().join("tictactoe.json");
    let file = File::create(file_name.clone()).expect("failed to open file");

    // Spawn the command and redirect stdout to the temporary file
    // We can't read the output directly because it's too big
    let output = Command::new("quint")
        .arg("compile")
        .arg(file_path)
        .args(["--init", init])
        .args(["--step", step])
        .args(["--invariant", inv.unwrap_or("true")])
        .args(main.map(|m| vec!["--main", m]).unwrap_or_default())
        .args(["--flatten", "false"])
        .stdout(file)
        .output()?;

    if !output.status.success() {
        return Err(format!(
            "Quint compilation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )
        .into());
    }
    // Read the output from the temporary file
    let mut serialized_quint = String::new();
    let mut file = File::open(file_name)?;
    file.read_to_string(&mut serialized_quint)?;

    let jd = &mut serde_json::Deserializer::from_str(serialized_quint.as_str());
    let output: QuintOutput = serde_path_to_error::deserialize(jd).unwrap();

    Ok(ParsedQuint {
        init: output
            .find_definition_by_name("q::init")
            .unwrap()
            .expr
            .clone(),
        step: output
            .find_definition_by_name("q::step")
            .unwrap()
            .expr
            .clone(),
        invariants: vec![output
            .find_definition_by_name("q::inv")
            .unwrap()
            .expr
            .clone()],
        witnesses: vec![],
        table: output.table,
    })
}

impl QuintOutput {
    pub fn find_definition_by_name<'a>(&'a self, name: &str) -> Result<&'a OpDef, Box<dyn Error>> {
        self.modules
            .iter()
            .find(|m| m.name == self.main)
            .and_then(|module| {
                module.declarations.iter().find_map(|d| match d {
                    QuintDeclaration::QuintOpDef(def) if def.name == name => Some(def),
                    _ => None,
                })
            })
            .ok_or_else(|| "Input definition not found".into())
    }
}
