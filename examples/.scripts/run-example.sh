#!/usr/bin/env bash
# shellcheck disable=SC3043,SC3020

# Run a single example spec thru parsing, typechecking, tests, and verification
# and print a single markdown table row reporting the results.
#
# Usage:
#
#    ./run-example path/to/my/spec.qnt

result () {
    local cmd="$1"
    if ($cmd &> /dev/null)
    then
        printf ":white_check_mark:"
    else
        printf ":x:"
    fi
}

file="$1"
syntax="$(result "quint parse ${file}")"
types="$(result "quint typecheck ${file}")"
tests="$(result "quint test ${file}")"
verify="$(result "quint verify ${file}")"

echo "| [${file}](./${file}) | ${syntax} | ${types} | ${tests} | ${verify} |"
