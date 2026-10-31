#!/usr/bin/env bash
# shellcheck disable=SC3043,SC3020,SC3040,SC3044

# Run each example in parallel and sort the outputs

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
EXAMPLES_DIR="${SCRIPT_DIR}/.."
cd "$EXAMPLES_DIR"

export APALACHE_DIST=${APALACHE_DIST:-../quint/_build/apalache}
# Start the apalache server, and stop it when the script exits
"$APALACHE_DIST"/bin/apalache-mc server &> /dev/null &
server=$!
trap 'kill "$server" 2>/dev/null' EXIT
# Wait until the server accepts connections: otherwise, parallel `quint verify`
# runs may each fail to connect and start their own server on the same port
for _ in $(seq 120); do
  (exec 3<>/dev/tcp/localhost/8822) 2>/dev/null && break
  sleep 1
done
(exec 3<>/dev/tcp/localhost/8822) 2>/dev/null \
  || { echo "Apalache server did not open port 8822" >&2; exit 1; }

# We recursively glob all the .qnt files, and run ./run-example.sh on each.
#
# Since the output of each run is a row in the README.md table,
# sorting the outputs lexographically gets the results in the
# right order.
#
# We `cut` the first 2 characters of find to remove the leading `./`, making
# the output prettier.
find . -name "*.qnt" | cut -c3- | parallel "${SCRIPT_DIR}/run-example.sh" | env LC_ALL=C sort --ignore-case

echo
echo "[^nostatemachine]: This specification does not define a state machine."
echo "[^parameterized]: This specification is parameterized, and instantiated in another module."
echo "[^notests]: This specification does not define any tests."
