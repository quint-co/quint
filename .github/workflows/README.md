# Quint GitHub CI Workflows

This folder contains the Continuous Integration (CI) workflows for the Quint project. Most of them run on PRs and pushes to the main branch, except for the release workflows described below, and for the benchmark workflow, whose output is a PR comment and therefore only runs on PRs.

The benchmark workflow fails if any benchmark gets more than 10% slower than on the base branch. It runs with a read-only token, since PRs opened from forks never get a write token. It uploads its results as an artifact, and `benchmark-comment.yml` posts them as a PR comment from a `workflow_run` trigger, which has a write token and never runs PR code. The results are also shown in the run's job summary.

We use the `paths-filter` action instead of constraining the triggers because these checks are required by GitHub configuration, and a required check that doesn't get trigger on a PR will block it from being merged.

## Release workflows

## Releasing Quint CLI: [./release.yml](./release.yml)

- Triggered on push of tags matching the release format `v*.*.*`.
- Runs tests, then creates a gh release of the source code and publishes the
  quint executable to npm.
- Requires the `NPM_TOKEN` secret is provided as a [repository
  secret](https://github.com/quint-co/quint/settings/secrets/actions),
  with permissions to write to the quint package.

## Releasing the Rust evaluator [./release-evaluator.yml](./release-evaluator.yml)
- Triggered on push of tags matching the release format `evaluator/v*.*.*`.
- Can also be manually dispatched.
- Compiles binaries for all platforms and creates a gh release of the source code
  and the binaries.

