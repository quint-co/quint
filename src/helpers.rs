use crate::ir::QuintOutput;
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
    let parsed: QuintOutput = serde_path_to_error::deserialize(jd).unwrap();
    Ok(parsed)
}

pub fn parse_from_path(
    file_path: &Path,
    init: &str,
    step: &str,
    inv: Option<&str>,
) -> Result<QuintOutput, Box<dyn Error>> {
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
    let parsed: QuintOutput = serde_path_to_error::deserialize(jd).unwrap();
    Ok(parsed)
}
