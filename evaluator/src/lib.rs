//! A Quint evaluator written in Rust.
//!
//! Evaluation is done by compiling Quint expressions and definitions into Rust closures,
//! which can be evaluated to yield the expression's result.

pub mod builtins;
pub mod evaluator;
pub mod helpers;
pub mod ir;
pub mod itf;
pub mod log;
pub mod normalizer;
pub mod picker;
pub mod rand;
pub mod simulator;
pub mod storage;
pub mod value;
