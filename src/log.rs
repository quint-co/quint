//! Logging module for the simulation, used by the CLI.

use std::fmt;
use std::sync::atomic::AtomicBool;

static _HEADERS: &[&str] = &["Parsing", "Simulation", "Result", "Elapsed"];

pub static JSON: AtomicBool = AtomicBool::new(false);

pub fn set_json(value: bool) {
    JSON.store(value, std::sync::atomic::Ordering::Relaxed);
}

pub fn get_json() -> bool {
    JSON.load(std::sync::atomic::Ordering::Relaxed)
}

const _: () = {
    let mut max = 0;
    let mut i = 0;
    while i < _HEADERS.len() {
        if _HEADERS[i].len() > max {
            max = _HEADERS[i].len();
        }
        i += 1;
    }

    // If this assertion fails, it means that the headers will not be properly aligned.
    // To fix this, update the assertion with the new maximum length,
    // and update the `println!` invocation in the `log` funnction
    // to pad the header by `max + 2` spaces.
    if max != 10 {
        panic!(
            "Maximum header width is different than the expected value. \
             Update the assertion and the `println!` invocation in the `log` function."
        );
    }
};

pub fn log(header: &str, message: &fmt::Arguments<'_>) {
    use colored::Colorize;

    if get_json() {
        let json = serde_json::json!({
            "header": header,
            "message": message,
        });
        println!("{json}");
    } else {
        println!("{:>12} {}", header.yellow(), message);
    }
}

#[macro_export]
macro_rules! log {
    ($header:expr, $($arg:expr),+ $(,)?) => {{
        $crate::log::log($header, &format_args!($($arg),+));
    }};
}
