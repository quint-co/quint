use quint_simulator::ir::QuintOutput;
use std::process::Command;
use std::{error::Error, io::Write};
use tempfile::NamedTempFile;

pub fn parse(quint_content: &str) -> Result<QuintOutput, Box<dyn Error>> {
    let mut temp_file = NamedTempFile::new()?;
    temp_file.write_all(quint_content.as_bytes())?;
    let output = Command::new("quint")
        .arg("compile")
        .arg(temp_file.path())
        .output()?;
    if !output.status.success() {
        return Err(format!(
            "Quint compilation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )
        .into());
    }
    let serialized_quint = String::from_utf8(output.stdout)?;
    let parsed: QuintOutput = serde_json::from_str(&serialized_quint)?;
    Ok(parsed)
}
