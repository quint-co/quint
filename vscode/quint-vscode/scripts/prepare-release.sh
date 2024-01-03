#!/usr/bin/env bash

set -euo pipefail
# set -x

# Throughout this script, we run many commands in subshells (i.e., wrapped in
# parens) so that the directory changes needed for the command don't persist
# further in the script.

# Ensure that the script works when called from any directory
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )
ROOT_DIR=$(cd "$DIR"/../../../ && pwd)
QUINT_DIR="$ROOT_DIR"/quint
PLUGIN_DIR="$ROOT_DIR"/vscode/quint-vscode
SERVER_DIR="$PLUGIN_DIR"/server
PLUGIN_CHANGELOG="$PLUGIN_DIR"/CHANGELOG.md

if [[ -z "${1-}" ]]
then
    echo "ERROR: An argument valid for 'npm version <arg>' must be supplied."
    echo "See 'npm version --help'."
    exit 1
fi
bump_increment="$1"

git checkout main;
git pull origin main;

QUINT_VERSION=$(cd "$QUINT_DIR" && npm pkg get version | sed 's/"//g')

# See https://stackoverflow.com/a/1885534/1187277
read -p "Prepare [${bump_increment}] release for vscode plugin targeting quint version [$QUINT_VERSION]? [yN]" -n 1 -r
echo
if ! [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Canceling release"
    exit 1
fi

# Bump plugin version
(cd "$PLUGIN_DIR" && npm version "$bump_increment")
(cd "$SERVER_DIR" && npm version "$bump_increment")
version=$(cd "$PLUGIN_DIR" && npm pkg get version | sed 's/"//g')

# Update changelog
TMP_CHANGES=$(mktemp)
trap 'rm "$TMP_CHANGES"' EXIT

(
cd "$PLUGIN_DIR"
release_date=$(printf '%(%Y-%m-%d)T\n' -1)
version_heading="## v${version} -- ${release_date}"

# Update the changelog
sed -i "s/## UNRELEASED/## UNRELEASED\n\
\n\
### Added\n\
### Changed\n\
### Deprecated\n\
### Removed\n\
### Fixed\n\
### Security\n\
\n\
${version_heading}/" "$PLUGIN_CHANGELOG"
)

# Get the release notes for the version by printing all lines between lines
# starting with the version header and ending with the next version header,
# inclusive. We then drop the last line to remove the subsequent version header.
# It's saved to a temp file for later use.
sed -n "/## v$version/,/## v/p" "$PLUGIN_CHANGELOG" | head -n -1 > "$TMP_CHANGES"

# Ensure we can build package?
# Ensure we can build the project
(
    cd "$SERVER_DIR"
    yalc remove @informalsystems/quint
    npm install "@informalsystems/quint@${QUINT_VERSION}"
)

(
    cd "$PLUGIN_DIR"
    npm install
    npm run compile
)

pr_title="VSCode Release v$version"
release_branch="vscode-release/${version}"
git checkout -b "$release_branch"
git add "$PLUGIN_DIR"/{CHANGELOG.md,package.json,package-lock.json}
git add "$SERVER_DIR"/{package.json,package-lock.json}
git commit -S -m "$pr_title"
git push origin "$release_branch"

gh pr create --title "$pr_title" --body-file "$TMP_CHANGES"
git checkout main
git branch -D "$release_branch"
