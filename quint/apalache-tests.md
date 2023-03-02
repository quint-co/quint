# Integration tests against Apalache


All of the test inputs in the following test cases are commands executed by `bash`.

<!-- !test program
PATH=_build/apalache/bin:$PATH bash -
-->


<!-- !test in can check booleans.qnt -->
```
quint typecheck --out _build/booleans.qnt.json ../examples/language-features/booleans.qnt
apalache-mc check _build/booleans.qnt.json | grep -o "EXITCODE: OK"
```

<!-- !test out can check booleans.qnt -->
```
EXITCODE: OK
```
