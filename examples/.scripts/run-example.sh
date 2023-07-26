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
    local args="$2"
    local file="$3"

    # Skip verification for specs that do not define a state machine
    if [[ "$file" =~ ^spells/ && "$cmd" == "verify" ]] ; then
      printf "N/A"; return
    elif [[ "$file" == "solidity/SimpleAuction/SimpleAuction.qnt" && "$cmd" == "verify" ]] ; then
      printf "N/A"; return
    fi

    # Run the command and record success / failure
    local quint_cmd="quint $cmd $args $file"
    if ($quint_cmd &> /dev/null)
    then
        printf ":white_check_mark:"
    else
        printf ":x:"
    fi

    # Print additional explanations
    if [[ "$file" == "solidity/icse23-fig7/lottery.qnt" && "$cmd" == "verify" ]] ; then
      printf "<sup>https://github.com/informalsystems/quint/issues/1019</sup>"
    fi
}

get_main () {
  local file="$1"
  local main=""
  if [[ "$file" == "classic/distributed/LamportMutex/LamportMutex.qnt" ]] ; then
    main="--main=LamportMutex_3_10"
  elif [[ "$file" == "classic/distributed/ReadersWriters/ReadersWriters.qnt" ]] ; then
    main="--main=ReadersWriters_5"
  elif [[ "$file" == "cosmos/ics20/bank.qnt" ]] ; then
    main="--main=bankTests"
  elif [[ "$file" == "cosmos/ics20/denomTrace.qnt" ]] ; then
    main="--main=properChannelsTests"
  elif [[ "$file" == "cosmos/ics20/ics20.qnt" ]] ; then
    main="--main=ics20Test"
  elif [[ "$file" == "puzzles/prisoners/prisoners.qnt" ]] ; then
    main="--main=prisoners3"
  elif [[ "$file" == "solidity/ERC20/erc20.qnt" ]] ; then
    main="--main=erc20Tests"
  elif [[ "$file" == "solidity/SimplePonzi/simplePonzi.qnt" ]] ; then
    main="--main=simplePonziTest"
  elif [[ "$file" == "solidity/GradualPonzi/gradualPonzi.qnt" ]] ; then
    main="--main=gradualPonziTest"
  fi
  echo "${main}"
}

get_test_args () {
  local file="$1"
  local args=""
  if [[ "$file" == "cosmos/ics20/ics20.qnt" ]] ; then
    args="--max-samples=1000"  # default of 10000 takes too long
  fi
  echo "${args}"
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
syntax=$(result parse "" "$file")
types=$(result typecheck "" "${file}")
main_flag=$(get_main "${file}")
test_args=$(get_test_args "${file}")
tests=$(result test "${test_args} ${main_flag}" "${file}")
verify_args=$(get_verify_args "${file}")
verify=$(result verify "--max-steps=3 ${verify_args} ${main_flag}" "${file}")

echo "| [${file}](./${file}) | ${syntax} | ${types} | ${tests} | ${verify} |"
