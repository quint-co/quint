static _HEADERS: &[&str] = &["Parsing", "Simulation", "Result", "Elapsed"];

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

#[macro_export]
macro_rules! log {
    ($header:expr, $($arg:expr),+ $(,)?) => {{
        use colored::Colorize;
        println!("{:>12} {}", $header.yellow(), format_args!($($arg),+));
    }};
}
