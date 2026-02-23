//! The evaluator's progress report module.

use std::{
    io::{self, Write},
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    thread::{self, JoinHandle},
    time::Duration,
};

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
        let mut stderr = io::stderr();
        serde_json::to_writer(stderr, &progress).expect("failed to write progress to stdout");
        write!(stderr, "\n").expect("failed to write \n to stderr");
    }
}

#[inline]
pub fn json_std_err_report(total_samples: usize) -> impl Reporter {
    JsonStdErr {
        total_samples,
        ..Default::default()
    }
}

/// The interval between reports when using a reporter thread.
const REPORT_THREAD_INTERVAL: Duration = Duration::from_millis(100);

/// A reporter thread handler.
///
/// It holds a reference to a `Reporter` that can be shared across threads, and
/// a `JoinHandler` for its running thread. The thread gets dropped when the
/// `ReporterThread` instance gets dropped.
pub struct ReporterThread {
    pub reporter: Arc<SharedReporter>,
    _handler: JoinHandle<()>,
}

/// A shared implementation of the `Reporter` trait.
///
/// Reports only mutate local state atomically. The reporter thread flushes
/// reports to std error periodically.
pub struct SharedReporter {
    current_samples: AtomicUsize,
    total_samples: usize,
}

impl Reporter for Arc<SharedReporter> {
    fn next_sample(&mut self) {
        self.current_samples.fetch_add(1, Ordering::Relaxed);
    }
}

pub fn spawn_reporter_thread(total_samples: usize) -> ReporterThread {
    let reporter = Arc::new(SharedReporter {
        current_samples: AtomicUsize::new(0),
        total_samples,
    });

    let handler = {
        let reporter = Arc::clone(&reporter);
        thread::Builder::new()
            .name("reporter-thread".to_owned())
            .spawn(|| reporter_thread_loop(reporter))
            .expect("failed to spawn reporter thread")
    };

    ReporterThread {
        _handler: handler,
        reporter,
    }
}

fn reporter_thread_loop(reporter: Arc<SharedReporter>) {
    let mut stderr = io::stderr().lock();
    let mut last_report = 0;
    loop {
        let curr_report = reporter.current_samples.load(Ordering::Relaxed);
        if curr_report != last_report {
            last_report = curr_report;
            let progress = JsonStdErr::fmt(curr_report, reporter.total_samples);
            writeln!(stderr, "{progress}").expect("failed to write to stderr");
        }
        thread::sleep(REPORT_THREAD_INTERVAL);
    }
}
