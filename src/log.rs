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
    assert!(max == 10);
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
