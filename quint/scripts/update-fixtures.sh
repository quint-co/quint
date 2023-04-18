#!/usr/bin/env bash
# Ignore shellcheck errors that don't pertain to bash
# shellcheck disable=SC3043,SC3040

set -euo pipefail
# set -x

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
QUINT_DIR="$SCRIPT_DIR"/..
cd "$QUINT_DIR"

# Ensure quint is installed
quint --version

generate_source_maps () {
    local file="$1"
    local basename="${file%.qnt}"
    quint parse "$file" \
        --out "${basename}.json" \
        --source-map "${basename}.map.json" \
        || true # erroneous parses are valid test input
    for j in "$basename"{.map,}.json
    do
        # If the file doesn't exist, we assume its because parsing was intended to fail
        # if this breaks expectation in the tests, it will show up in the unit tests.
        if [ -f "$j" ]
        then
           # starting with "
           perl -pi -e 's#"/.*?/testFixture#"mocked_path/testFixture#g' "$j"
           # starting with '
           perl -pi -e "s#'/.*?/testFixture#'mocked_path/testFixture#g" "$j"
        fi
    done
}

for f in testFixture/*.qnt
do
    generate_source_maps "$f"
done
