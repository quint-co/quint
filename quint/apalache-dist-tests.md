## Apalache distribution tests

<!-- !test program
bash -
-->

These tests check management of the Apalache server from Quint.
They are in a separate file from `apalache-test.md` since they presuppose an
environment in which Apalache server has not been started.

### Inability to connect to the server downloads Apalache

There is no Apalache server running. This will try to load the proto file
dynamically, using gRPC reflection, recognize that the server is not available,
fetch a tagged Apalache release and spawn a server in the background.

The second time we call Apalache, we already have an up-to-date Apalache
distribution on-disk. Quint re-uses this distribution and does not download
again.


<!-- !test in server not running -->
```
quint verify --verbosity=1 ../examples/language-features/booleans.qnt | \
  sed 's!https://.*!(asseturl)!' | \
  sed -e 's/([0-9]*ms)/(duration)/'
quint verify --verbosity=1 ../examples/language-features/booleans.qnt | \
  sed 's!\(Using existing Apalache distribution in \).*!\1(distdir)!' | \
  sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out server not running -->
```
Downloading Apalache distribution 0.49.0... done.
[ok] No violation found (duration).
[ok] No violation found (duration).
```
