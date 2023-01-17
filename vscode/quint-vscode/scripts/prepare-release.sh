#!/usr/bin/env bash

QUINT_VERSION=0.5.2

function pause(){
   read -p "$*"
}

git checkout main;
git pull origin main;
echo "Ensure that the VSCode version was bumped."
echo "Extension: $(cat package.json | jq .version | xargs)."
echo "Server: $(cat server/package.json | jq .version | xargs)."
echo "You can run npm version x.y.z to bump it. Remember to bump the server as well."
pause 'Press [Enter] key to continue...'
echo "Ensure that the quint dependency is correct, currently: $QUINT_VERSION. Update this script to change it."
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
