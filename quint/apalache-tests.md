# Integration tests against Apalache


All of the test inputs in the following test cases are commands executed by `bash`.

<!-- !test program
PATH=_build/apalache/bin:$PATH bash -
-->


## Can check `../examples/language-features/booleans.qnt`

<!-- !test in can check booleans.qnt -->
```
quint typecheck --out _build/booleans.qnt.json ../examples/language-features/booleans.qnt
apalache-mc check _build/booleans.qnt.json | grep -o "EXITCODE: OK"
```

<!-- !test out can check booleans.qnt -->
```
EXITCODE: OK
```

## Can check `../examples/language-features/integers.qnt`

<!-- !test in can check integers.qnt -->
```
quint typecheck --out _build/integers.qnt.json ../examples/language-features/integers.qnt
apalache-mc check _build/integers.qnt.json | grep -o "EXITCODE: OK"
```

<!-- !test out can check integers.qnt -->
```
EXITCODE: OK
```

## Can check `../examples/language-features/sets.qnt`

<!-- !test in can check sets.qnt -->
```
quint typecheck --out _build/sets.qnt.json ../examples/language-features/sets.qnt
apalache-mc check _build/sets.qnt.json | grep -o "EXITCODE: OK"
```

<!-- !test out can check sets.qnt -->
```
EXITCODE: OK
```
