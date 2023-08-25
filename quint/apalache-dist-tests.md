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
quint verify ../examples/language-features/booleans.qnt | \
  sed 's!https://.*!(asseturl)!'
quint verify ../examples/language-features/booleans.qnt | \
  sed 's!\(Using existing Apalache distribution in \).*!\1(distdir)!'
```

<!-- !test out server not running -->
```
Couldn't connect to Apalache, checking for latest supported release
Downloading Apalache distribution from (asseturl)
Launching Apalache server
Shutting down Apalache server
Couldn't connect to Apalache, checking for latest supported release
Using existing Apalache distribution in (distdir)
Launching Apalache server
Shutting down Apalache server
```
