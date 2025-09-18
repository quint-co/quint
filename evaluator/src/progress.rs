//! The evaluator's progress report module.

use serde_json::Value;

/// A progress reporter.
pub trait Reporter {
    /// Reports that the system has moved to the next sample.
    fn next_sample(&mut self);
}

/// A noop reporter that produces no output.
struct NoReport;

impl Reporter for NoReport {
    fn next_sample(&mut self) {}
}

#[inline]
pub fn no_report() -> impl Reporter {
    NoReport
}

/// A reporter that writes progress in JSON format to the std error output.
#[derive(Default)]
struct JsonStdErr {
    current_samples: usize,
    total_samples: usize,
}

impl JsonStdErr {
    #[inline]
    fn fmt(samples: usize, total: usize) -> Value {
        let percentage = (samples as f64 / total as f64 * 100.0).round() as u32;
        serde_json::json!({
            "type": "progress",
            "current": samples,
            "total": total,
            "percentage": percentage
        })
    }
}

impl Reporter for JsonStdErr {
    fn next_sample(&mut self) {
        self.current_samples += 1;
        let progress = Self::fmt(self.current_samples, self.total_samples);
        eprintln!("{progress}");
    }
}

#[inline]
pub fn json_std_err_report(total_samples: usize) -> impl Reporter {
    JsonStdErr {
        total_samples,
        ..Default::default()
    }
}
