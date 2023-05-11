## Apalache distribution tests

<!-- !test program
bash -
-->

These tests check for error handling around misconfiguration or corruption of
the apalache distribution. They are in a separate file from `apalache-test.md`
since they presuppose a broken environment, whereas the apalache integration
tests assume a working environment.


### Problems with the Apalache distribution

#### Setting a Non-existent `APALACHE_HOME` produces an error

<!-- !test in invalid APALACHE_DIST -->
```
APALACHE_DIST=/does/not/exist quint verify ../examples/language-features/booleans.qnt
```

<!-- !test exit 1 -->
<!-- !test err invalid APALACHE_DIST -->
```
error: Specified APALACHE_DIST /does/not/exist does not exist
```

#### Setting a corrupted `APALACHE_DIST` produces an error

(The `_build` dir exists, but doesn't have the expected structure of the
Apalache distribution.)

<!-- !test in corrupted APALACHE_DIST -->
```
APALACHE_DIST=_build quint verify ../examples/language-features/booleans.qnt 2> >(sed "s:$PWD/::g" >&2)
```

<!-- !test exit 1 -->
<!-- !test err corrupted APALACHE_DIST -->
```
error: Apalache distribution is corrupted. Cannot find _build/lib/apalache.jar or _build/bin/apalache-mc.
```

#### Extracting the proto file from a corrupted jar file produces an error

We set up a valid looking distribution, but with an invalid jar file.

<!-- !test in corrupted apalache.jar -->
```
mkdir -p _build/corrupt-dist-test/bin && touch _build/corrupt-dist-test/lib/apalache.jar
mkdir -p _build/corrupt-dist-test/lib && touch _build/corrupt-dist-test/bin/apalache-mc
APALACHE_DIST=_build/corrupt-dist-test quint verify ../examples/language-features/booleans.qnt 2> >(sed "s:$PWD/::g" >&2)
```

<!-- !test exit 1 -->
<!-- !test err corrupted apalache.jar -->
```
error: Apalache distribution is corrupted. Could not extract proto file from apalache.jar.
```

### Inability to connect to the server produces an errer

Wen now assume a correctly configured installation of Apalache, but that the
server it not running.

<!-- !test program
APALACHE_DIST=_build/apalache PATH=_build/apalache/bin:$PATH bash -
-->

<!-- !test in sever errors and connections -->
```
quint verify ../examples/language-features/booleans.qnt
```

<!-- !test exit 1 -->
<!-- !test err sever errors and connections  -->
```
error: Failed to obtain a connection to Apalache after 5 seconds.
```
