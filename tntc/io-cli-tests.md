This is a suite of blackbox integration tests for the `tntc` executable. 
The tests in this file check that particular output is produced when 
particular input is received.

These tests require [`txm`](https://www.npmjs.com/package/txm) to be installed:

```sh
npm install -g txm
```

All of the test inputs in the following test cases are commands executed by `bash`.

<!-- !test program
bash -
-->

### User error on parse with non-existent file

Regression test for [#215](https://github.com/informalsystems/tnt/issues/215).
We want to ensure we do not throw uncaught exceptions when the input file is
doesn't exist.

<!-- !test in non-existent file -->
    tntc parse ../examples/non-existent.file

<!-- !test exit 1 -->
<!-- !test err non-existent file -->
    error: file ../examples/non-existent.file does not exist


