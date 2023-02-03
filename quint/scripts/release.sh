#!/usr/bin/env bash

version=$(npm pkg get version | sed 's/"//g')
commit_message=$(git log -1 --pretty=%B)
expected_message="Release v${version}"

if [[ "$commit_message" != "$expected_message" ]]
then
    echo "Commit message of HEAD is '${commit_message}'."
    echo "The next release may only be cut from a release commit with message '${expected_message}'."
    echo "Check out a release commit and run this script again."
    exit 2
fi

git tag -s -a "v${version}" -m "$commit_message"
git push origin "v${version}"
