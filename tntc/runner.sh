#!/usr/bin/env bash

# This runner script just reads each line from stdin and executes it, stripping off any
# trailing `\r` to normalize output on windows.
#
# The runner script ensures that the "program" run by txm is consistent between OSs:
# I.e. that it is always run with bash
#
# We use it in ./cli-tests.md to run our black box CLI commands.

set -euo pipefail

export LANG="C.UTF-8"
export LANGUAGE=
export LC_CTYPE="C.UTF-8"
export LC_NUMERIC="C.UTF-8"
export LC_TIME="C.UTF-8"
export LC_COLLATE="C.UTF-8"
export LC_MONETARY="C.UTF-8"
export LC_MESSAGES="C.UTF-8"
export LC_PAPER="C.UTF-8"
export LC_NAME="C.UTF-8"
export LC_ADDRESS="C.UTF-8"
export LC_TELEPHONE="C.UTF-8"
export LC_MEASUREMENT="C.UTF-8"
export LC_IDENTIFICATION="C.UTF-8"
export LC_ALL=

while IFS= read -r cmd; do
    # All the noise here with FDs is to filter both stdout and stderr
    # See https://stackoverflow.com/a/31151808/1187277
    bash -c "$cmd"
done
