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


<!-- !test in server not running -->
```
quint verify ../examples/language-features/booleans.qnt
```

<!-- !test out server not running -->
```
Couldn't connect to Apalache, downloading latest supported release
...
Launching Apalache server
Shutting down Apalache server
```
