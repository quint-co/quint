# Integration tests against Apalache


All of the test inputs in the following test cases are commands executed by
`bash`.

We currently assume that the Apalache server has already been started. 
So before running these tests, in a separate terminal session, run

```
apalache-mc server
```

This requirement will be removed with https://github.com/informalsystems/quint/issues/823

<!-- !test program
APALACHE_DIST=_build/apalache bash -
-->

## Configuration errors

### Verifying spec with invalid init param produces an error

<!-- !test in invalid init -->
```
quint verify --init=invalidInit ../examples/language-features/booleans.qnt
```

<!-- !test exit 1 -->
<!-- !test err invalid init -->
```
error: Configuration error (see the manual): Operator invalidInit not found (used as the initialization predicate)
```


## Successful verification

### Can verify `../examples/language-features/booleans.qnt`

<!-- !test check can check booleans.qnt -->
```
quint verify --init Init --step Next ../examples/language-features/booleans.qnt
```


### Can verify `../examples/language-features/integers.qnt`

<!-- !test check can check integers.qnt -->
```
quint verify --init Init --step Next ../examples/language-features/integers.qnt
```

### Can verify `../examples/language-features/sets.qnt`

<!-- !test check can check sets.qnt -->
```
quint verify --init Init --step Next ../examples/language-features/sets.qnt
```


### Can verify `../examples/language-features/lists.qnt`

<!-- !test check can check lists.qnt -->
```
quint verify --init Init --step Next ../examples/language-features/lists.qnt
```


### Can verify `../examples/language-features/maps.qnt`

<!-- !test check can check maps.qnt -->
```
quint verify --init Init --step Next ../examples/language-features/maps.qnt
```

### Default `step` and `init` operators are found

<!-- !test check can find default operator names -->
```
quint verify ../examples/verification/defaultOpNames.qnt
```

### Can verify with single invariant

<!-- !test check can specify --invariant -->
```
quint verify --invariant inv ../examples/verification/defaultOpNames.qnt
```

### Can verify with two invariants

<!-- !test check can specify multiple invariants -->
```
quint verify --invariant inv,inv2 ../examples/verification/defaultOpNames.qnt
```

## Violations

### Variant violations are reported with traces

<!-- !test in prints a trace on invariant violation -->
```
quint verify --invariant inv ./testFixture/apalache/violateOnFive.qnt
```

<!-- !test exit 1 -->
<!-- !test err prints a trace on invariant violation -->
```
```
