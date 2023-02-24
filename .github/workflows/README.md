# Quint GitHub CI Workflows

## [./main.yml](./main.yml)

- Triggered on pull requests into `main`.
- Our primary build and test workflow.

## [./release.yml](./release.yml)

- Triggered on push of tags matching the release format `v*.*.*`.
- Runs tests, then creates a gh release of the source code and publishes the
  quint executable to npm.
- Requires the `NPM_TOKEN` secret is provided as a [repository
  secret](https://github.com/informalsystems/quint/settings/secrets/actions),
  with permissions to write to the quint package.
