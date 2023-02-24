#!/usr/bin/env bash

set -euo pipefail
set -x

gh --version || (echo "gh must be installed: https://github.com/cli/cli#installation" && exit 1)
npm --version || (echo "npm must be installed" && exit 1)

gh auth status || gh auth login

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$SCRIPT_DIR"/../..
CHANGELOG="${ROOT_DIR}/CHANGELOG.md"
cd "$SCRIPT_DIR"/..

if [[ -z "$1" ]]
then
    echo "An argument valid for 'npm version <arg>' must be supplied."
    echo "See 'npm version --help'."
    exit 1
fi
bump_increment="$1"

npm version "$bump_increment"
version=$(npm pkg get version | sed 's/"//g')

release_branch=release/"$version"
git fetch origin main
git checkout -b "$release_branch"

release_date=$(printf '%(%Y-%m-%d)T\n' -1)
version_heading="## v${version} -- ${release_date}"

TMP_CHANGES=$(mktemp)
trap 'rm "$TMP_CHANGES"' EXIT

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
${version_heading}/" "$CHANGELOG"

# Get the release notes for the version by printing all lines between lines
# starting with the version header and ending with the next version header,
# inclusive. We then drop the last line to remove the subsequent version header.
# It's saved to a temp file for later use.
sed -n "/## v$version/,/## v/p" "$CHANGELOG" | head -n -1 > "$TMP_CHANGES"

pr_title="Release v$version"
git add package*.json "$CHANGELOG"
git commit -S -m "$pr_title"
git push origin "$release_branch"

gh pr create --title "$pr_title" --body-file "$TMP_CHANGES"
git checkout main
git branch -D "$release_branch"
