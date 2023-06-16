#!/usr/bin/env bash
# shellcheck disable=SC3043,SC3020,SC3040,SC3044

# Run each example in parallel and sort the outputs

set -euo pipefail

# Match directories with blobs recursively
# https://www.gnu.org/software/bash/manual/html_node/The-Shopt-Builtin.html
shopt -s globstar

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR"

# We recursively glob all the .qnt files, and run ./run-example.sh on each.
#
# Since the output of each run is a row in the README.md table,
# sorting the outputs lexographically gets the results in the
# right order.
parallel ./run-example.sh ::: **/*.qnt | sort
