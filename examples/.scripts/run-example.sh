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

    # Skip tests for parameterized modules
    if [[ "$cmd" == "test" && (
            "$file" == "classic/distributed/Paxos/Voting.qnt" ||
            "$file" == "cosmos/tendermint/Tendermint.qnt" ||
            "$file" == "cosmos/tendermint/TendermintTest.qnt" ||
            "$file" == "cosmos/lightclient/Blockchain.qnt" ||
            "$file" == "cosmos/lightclient/LCVerificationApi.qnt" ||
            "$file" == "cryptography/hashes.qnt" ) ]] ; then
      printf "N/A[^parameterized]"; return
    fi
    # Skip verification for specs that do not define a state machine
    if [[ "$cmd" == "verify" && (
            "$file" == "classic/distributed/Paxos/Voting.qnt" ||
            "$file" == "cosmos/lightclient/Blockchain.qnt" ||
            "$file" == "cosmos/lightclient/LCVerificationApi.qnt" ||
            "$file" == "cosmos/lightclient/typedefs.qnt" ||
            "$file" == "cosmos/tendermint/Tendermint.qnt" ||
            "$file" == "cosmos/tendermint/TendermintTest.qnt" ||
            "$file" =~ ^cryptography/hashes ||
            "$file" =~ ^spells/ ||
            "$file" == "solidity/SimpleAuction/SimpleAuction.qnt" ||
            "$file" == "tutorials/integers.qnt" ||
            "$file" == "tutorials/sets.qnt" ||
            "$file" == "tutorials/booleans.qnt" ||
            "$file" == "cosmos/ics20/base.qnt" ||
            "$file" == "cosmos/bank/bank.qnt" ) ]] ; then
      printf "N/A[^nostatemachine]"; return
    fi

    # Run the command and record success / failure
    local quint_cmd="quint $cmd $args $file"
    local succeeded=false
    if ($quint_cmd &> /dev/null)
    then
        printf ":white_check_mark:"
        succeeded=true
    else
        printf ":x:"
        succeeded=false
    fi

    # We only want to print additional info to annotate failing results
    if [[ $succeeded == false ]]; then
      # Print additional explanations
      if [[ "$file" == "solidity/icse23-fig7/lottery.qnt" && "$cmd" == "verify" ]] ; then
        printf "<sup>https://github.com/informalsystems/quint/issues/1285</sup>"
      elif [[ "$file" == "classic/distributed/Paxos/Paxos.qnt" && "$cmd" == "verify" ]] ; then
        printf "<sup>https://github.com/informalsystems/quint/issues/1284</sup>"
      elif [[ "$file" == "classic/distributed/TwoPhaseCommit/two_phase_commit_modules.qnt" && "$cmd" =~ (test|verify) ]] ; then
        printf "<sup>https://github.com/informalsystems/quint/issues/1299</sup>"
      elif [[ "$file" == "language-features/option.qnt" && "$cmd" == "verify" ]] ; then
        printf "<sup>https://github.com/informalsystems/quint/issues/1393</sup>"
      fi
    fi
}

get_main () {
  local file="$1"
  local main=""
  if [[ "$file" == "classic/distributed/ClockSync/clockSync6.qnt" ]] ; then
    main="--main=clock_sync4"
  elif [[ "$file" == "classic/distributed/LamportMutex/LamportMutex.qnt" ]] ; then
    main="--main=LamportMutex_3_10"
  elif [[ "$file" == "classic/distributed/ReadersWriters/ReadersWriters.qnt" ]] ; then
    main="--main=ReadersWriters_5"
  elif [[ "$file" == "classic/distributed/ewd840/ewd840.qnt" ]] ; then
    main="--main=ewd840_3"
  elif [[ "$file" == "classic/distributed/TwoPhaseCommit/two_phase_commit.qnt" ]] ; then
    main="--main=two_phase_commit_3"
  elif [[ "$file" == "classic/distributed/Paxos/Paxos.qnt" ]] ; then
    main="--main=Paxos_val2_accept3_quorum2"
  elif [[ "$file" == "classic/distributed/ConsensusAlgorithm/ConsensusAlg.qnt" ]] ; then
    main="--main=badValues"
  elif [[ "$file" == "classic/distributed/ConsensusAlgorithm/KSetAgreementConsensus.qnt" ]] ; then
    main="--main=KSetBadValues"
  elif [[ "$file" == "classic/sequential/BinSearch/BinSearch.qnt" ]] ; then
    main="--main=BinSearch10"
  elif [[ "$file" == "cosmos/ics20/bank.qnt" ]] ; then
    main="--main=bankTests"
  elif [[ "$file" == "cosmos/ics20/denomTrace.qnt" ]] ; then
    main="--main=properChannelsTests"
  elif [[ "$file" == "cosmos/ics20/ics20.qnt" ]] ; then
    main="--main=ics20Test"
  elif [[ "$file" == "cosmos/ics23/ics23.qnt" ]] ; then
    main="--main=trees"
  elif [[ "$file" == "cosmos/lightclient/Lightclient.qnt" ]] ; then
    main="--main=Lightclient_4_3_correct"
  elif [[ "$file" == "puzzles/prisoners/prisoners.qnt" ]] ; then
    main="--main=prisoners3"
  elif [[ "$file" == "games/secret-santa/secret_santa.qnt" ]] ; then
    main="--main=quint_team_secret_santa"
  elif [[ "$file" == "solidity/ERC20/erc20.qnt" ]] ; then
    main="--main=erc20Tests"
  elif [[ "$file" == "solidity/SimplePonzi/simplePonzi.qnt" ]] ; then
    main="--main=simplePonziTest"
  elif [[ "$file" == "solidity/GradualPonzi/gradualPonzi.qnt" ]] ; then
    main="--main=gradualPonziTest"
  elif [[ "$file" == "cosmwasm/zero-to-hero/vote.qnt" ]] ; then
    main="--main=state"
  elif [[ "$file" == "spells/BoundedUInt.qnt" ]] ; then
    main="--main=BoundedUInt8Test"
  fi
  echo "${main}"
}

get_test_args () {
  local file="$1"
  local args=""
  if [[ "$file" == "cosmos/ics20/ics20.qnt" ]] ; then
    args="--max-samples=1000"  # default of 10000 takes too long
  elif [[ "$file" == "cosmos/tendermint/TendermintModels.qnt" ]] ; then
    args="--max-samples=1000"  # default of 10000 takes too long
  fi
  echo "${args}"
}

get_verify_args () {
  local file="$1"
  local args=""
  if [[ "$file" == "classic/distributed/ClockSync/clockSync6.qnt" ]] ; then
    main="--invariant=skew_inv"
  elif [[ "$file" == "classic/distributed/LamportMutex/LamportMutex.qnt" ||
        "$file" == "classic/distributed/ReadersWriters/ReadersWriters.qnt" ||
        "$file" == "cosmos/lightclient/Lightclient.qnt" ]] ; then
    args="--init=Init --step=Next"
  elif [[ "$file" == "cosmos/tendermint/TendermintModels.qnt" ]] ; then
    args="--init=n4_f1::Init --step=n4_f1::Next --invariant=n4_f1::Agreement"
  elif [[ "$file" == "cosmos/ics23/ics23.qnt" ]] ; then
    args="--init=Init --step=Next"
  elif [[ "$file" == "games/tictactoe/tictactoe.qnt" ]] ; then
    args="--max-steps=1" # pretty slow, and we just want to check that verification can run
  elif [[ "$file" == "classic/distributed/TeachingConcurrency/teachingConcurrency.qnt" ]] ; then
    args="--invariant yContainsOne --inductive-invariant inv"
  elif [[ "$file" == "classic/distributed/TeachingConcurrency/mutex.qnt" ]] ; then
    args="--invariant=correctness --inductive-invariant=inv"
  elif [[ "$file" == "classic/distributed/ewd840/ewd840.qnt" ]] ; then
    args="--invariant TerminationDetection --inductive-invariant \"TypeOK and Inv\" --main ewd840_3"
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
