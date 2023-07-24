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

get_main () {
  local file="$1"
  local main=""
  if [[ "$file" == "classic/distributed/LamportMutex/LamportMutex.qnt" ]] ; then
    main="--main=LamportMutex_3_10"
  elif [[ "$file" == "classic/distributed/ReadersWriters/ReadersWriters.qnt" ]] ; then
    main="--main=ReadersWriters_5"
  elif [[ "$file" == "solidity/ERC20/erc20.qnt" ]] ; then
    main="--main=erc20Tests"
  elif [[ "$file" == "solidity/SimplePonzi/simplePonzi.qnt" ]] ; then
    main="--main=simplePonziTest"
  elif [[ "$file" == "solidity/GradualPonzi/gradualPonzi.qnt" ]] ; then
    main="--main=gradualPonziTest"
  fi
  echo "${main}"
}

get_verify_args () {
  local file="$1"
  local args=""
  if [[ "$file" == "classic/distributed/LamportMutex/LamportMutex.qnt" ]] ; then
    args="--init=Init --step=Next"
  elif [[ "$file" == "classic/distributed/ReadersWriters/ReadersWriters.qnt" ]] ; then
    args="--init=Init --step=Next"
  fi
  echo "${args}"
}

file="$1"
syntax="$(result "quint parse ${file}")"
types="$(result "quint typecheck ${file}")"
main="$(get_main "${file}")"
tests="$(result "quint test ${main} ${file}")"
verify_args="$(get_verify_args "${file}")"
verify="$(result "quint verify --max-steps=3 ${verify_args} ${main} ${file}")"

echo "| [${file}](./${file}) | ${syntax} | ${types} | ${tests} | ${verify} |"
