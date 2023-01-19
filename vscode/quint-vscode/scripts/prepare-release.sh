#!/usr/bin/env bash

if [[ -z "${QUINT_VERSION}" ]]; then
   echo "QUINT_VERSION environment variable is not set. Please set it to the version of the quint dependency you want to use."
   exit 1
fi

set -euo pipefail

function pause(){
   read -p "$*"
}

# Ensure that the script works when called from any directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR/..;

git checkout main;
git pull origin main;

echo "Ensure that the quint dependency is correct, currently: $QUINT_VERSION. Set the QUINT_VERSION environment variable to update it."
pause 'Press [Enter] key to continue...'

echo "Ensure that the VSCode version was bumped."
echo "Extension: $(cat package.json | jq .version | xargs)."
echo "Server: $(cat server/package.json | jq .version | xargs)."
echo "You can run npm version <major|minor|patch> to bump the correct level. Remember to bump the server as well."
pause 'Press [Enter] key to continue...'

echo "Ensure that CHANGELOG.md is updated: There is an entry for this release and no UNRELEASED header."
pause 'Press [Enter] key to continue...'

cd server;
yalc remove @informalsystems/quint;
npm install @informalsystems/quint@$QUINT_VERSION;
cd ..;
npm install;
npm run compile;

version=$(cat package.json | jq .version | xargs)
git checkout -b vscode-release/$version;
git add CHANGELOG.md;
git add package.json;
git add package-lock.json;
git add server/package.json;
git add server/package-lock.json;
git commit -S -m "Release VSCode extension v$version"

echo "All good!"
echo "Now check that everything is alright, push, and open a PR."
echo "When the PR is merged, run vsce publish on an updated main branch."
