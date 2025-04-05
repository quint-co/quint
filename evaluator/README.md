# Quint Evaluator 

A Quint evaluator written in Rust, currently used for simulations under a feature flag (`quint run --backend=rust`). The default is still the Typescript simulator.

Evaluation is done by compiling Quint expressions and definitions into Rust closures, which can be evaluated to yield the expression's result.

TODO: link CONTRIBUTING.md when we have one.

## Road to Feature Parity with the Typescript Simulator
- [ ] Support for `--seed` flag
- [ ] Support for `--mbt` flag
- [ ] Support for `--witnesses` flag
- [ ] Support for `--verbosity` flag

## Requirements before deprecating the Typescript Evaluator 
- [ ] Use the Rust evaluator for `quint test`
- [ ] Use the Rust evaluator for the REPL
