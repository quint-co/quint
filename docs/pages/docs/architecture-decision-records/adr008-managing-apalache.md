# ADR008: Obtaining and Launching Apalache from Quint

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 2023-11-13 | Thomas Pani      |

## 1. Summary

This ADR presents options on how to obtain and manage Apalache for use with
the Quint `verify` command.

## 2. Context

Quint modules can be verified through bounded model-checking by issuing the
`quint verify` command. This invokes [Apalache][] via it's [Shai][] RPC
interface.

There's three outstanding questions concerning this integration:

1. How is Shai managed (launched, stopped, ...)?
2. How is the Apalache distribution obtained?
3. How are version dependencies between Quint and Apalache managed?

Obviously, a decision on each of these questions impacts the other ones. We use
this document to survey options, and to list advantages and disadvantages, and to
document the proposed solution.

## 3. Options

### 3.1 Managing Apalache Server

We need to determine who or what manages Shai, so that it is running when the
user invokes `quint verify`.

#### 3.1.1 By the operating system

We rely on the user's operating system (e.g., systemd on Linux) to manage the
server. For example, @rnbguy's Arch package contains a [systemd service file](https://aur.archlinux.org/cgit/aur.git/tree/apalache.service?h=apalache-bin).

Pros:

- Independent of our current release/packaging practice.
- We can simply state version dependencies in our docs or release notes;
  resolving them lies with the packager.
- Transparent to the user.
- Reduced complexity for Quint / the VSCode extension: no need to install /
  manage Apalache from there.

Cons:

- Only leaves one option for resolving §3.2: Since this requires
  platform-dependent adaptions to register as a system-level service, this
  solution largely depends on installing Quint and Apalache through a
  system-level package manager (§3.2.1), and inherits its pros/cons.
- Shai permanently takes up resources (freshly launched: 125MB memory), while
  it's likely only used intermittently.
- Requires platform-dependent error message / intervention if Shai is not
  running.
- Additional logic in Quint for checking version compatilibity with Apalache.

#### 3.1.2 Manually by the user (in a separate terminal, ...)

This is our current setup for development practice: Shai is manually launched by
the user, usually in a separate terminal / screen session / or similar.

Pros:

- Independent of §3.2, as long as the `apalache-mc` command is available.
- Transparent to the user, running `apalache-mc server` is platform-independent.
- Reduced complexity for Quint / the VSCode extension: no need to install /
  manage Apalache from there.

Cons:

- Increased user overhead, for a task that could be automated.
- Additional logic in Quint for checking version compatilibity with Apalache.

##### Launching of a system service by the user


As a special case, the user may manually launch a system service (§3.1.1
above), e.g., via `systemctl` on Linux or `launchctl` on macOS. The pros/cons
in this case fall at the intersection of both options.

#### 3.1.3 Managed by Quint

This option launches Shai from the Quint binary (or the VSCode extension).

This is similar to how bazel [runs its build server](https://bazel.build/run/client-server),
and to how the Metals VSCode plugin [manages the metals server](https://github.com/scalameta/metals-vscode/blob/edc446cc58dc809f3ed7cfde15b1e7fd7b5be115/packages/metals-vscode/src/extension.ts#L175C10-L175C30).

##### On-demand vs long-lived

As a sub-option, we would have to decide if Shai is launched on-demand, for each
verification invocation, or long-lived for as long as the VSCode extension is
active. bazel and vscode-metals employ a hybrid approach, where a long-lived
server is launched on-demand and torn down after an inactivity timeout. This
decision should take into consideration the memory-overhead of a long-lived
server vs. JVM startup time for an on-demand approach; at the time of writing,
a freshly launched `apalache-mc server` takes ~125MB of memory, and JVM
startup time is below 2 seconds.

Pros:

- Independent of §3.2, as long as the `apalache-mc` command is available.
- Transparent and automated for the user.

Cons:

- Additional logic in Quint for managing Shai.
- Additional logic in Quint for managing version compatilibity with Apalache.
- Increased complexity if Shai is launched as long-lived server with a timeout,
  due to book-keeping demands.

### 3.2 Apalache Distribution

As a secondary question, we need to decide how Apalache is obtained, before
attempting to run it. We consider the following options:

- Manual installation, by the user
  - using the system package manager (apt, Homebrew, ...)
  - using an ecosystem package manager (npm, coursier, ...)
  - using the Github release directly (xcopy-deploy the JAR file)
- Automatically and on-demand, from Quint
  - using either of the suboptions above
- Apalache is fully cloud-hosted, Quint uses it as SaaS

#### 3.2.1 Using the system-level package manager (apt, Homebrew, ...)

The user uses a platform-specific package manager, like `apt` or `Homebrew` to
install Apalache and, perhaps, Quint.

Pros:

- Outsources the task of keeping Quint and Apalache versions in sync.
- Takes care of Apalache's JRE dependency, as a package dependency.

Cons:

- Requires differing per-platform docs/instructions.
- Requires maintaining per-platfrom packages; unclear who could provide and maintain these.
- Quint is already available from npm.

#### 3.2.2 Using an ecosystem package manager (npm, coursier, ...)

The user uses an ecosystem package manager, like `npm` for TypeScript or
`coursier` for Scala to install Quint and/or Apalache.

Pros:

- Platform independent, only requires one set of instructions.
- Quint is already released on `npm`.

Cons:

- Additional packaging and maintenance effort.
- Including Apalache as a non-optional dependency of Quint would increase
  distribution size a lot – many users don't need Apalache.
  - `npm` has no good support for conditional dependencies.
- Does not address Apalache's JRE dependency.

#### 3.2.3 Using the Github release directly (xcopy-deploy the JAR file)

This is currently the [recommended way for obtaining Apalache](https://apalache.informal.systems/docs/apalache/installation/jvm.html):
Download the Github release, and unpack Apalache's JAR file to the target system.

Pros:

- Largly platform independent, only requires one set of instructions.
- No additional packaging and maintenance effort.

Cons:

- Not fully automated through a package manager.
- Users have to manually update Apalache.
- Does not address Apalache's JRE dependency.

#### 3.2.4 Automatically and on-demand, from Quint

Quint obtains an Apalache distribution on-demand. For example, the Metals VSCode
extension [fetches the metals server](https://github.com/scalameta/metals-vscode/blob/edc446cc58dc809f3ed7cfde15b1e7fd7b5be115/packages/metals-vscode/src/extension.ts#L175C10-L175C30) via coursier.

Sub-options include:

1. Invoking the system-level package manager from Quint (see §3.2.1)
2. Invoking an ecosystem package manager from Quint (see §3.2.2)
3. Pull the Apalache distribution from Github (see §3.2.3)

##### 1. Invoking the system-level package manager from Quint

Invoking a system-level package manager from Quint seems infeasible; we would
have to include logic for various platforms within Quint.

##### 2. Invoking an ecosystem package manager from Quint

Here, we would invoke `npm` or `coursier` from Quint.

Pros:

- Completely transparent to the user.
- Allows managing the required Apalache version from within Quint.
- No system-level dependency like above.

Cons:

- Assumes that a package manager (npm, coursier, ...) and the JRE are installed on the local system.
  - To work around this, we could distribute the package manager with Quint
    (for example, `vscode-metals` includes a `coursier` binary in its
    distribution).
- Spawning a package manager increases complexity by running a process whose
  behavior is outside of our control.

##### 3. Pulling the Apalache distribution from Github

We either hardcode a fixed Apalache release (and its artifact URL) in Quint, or
use [Github's REST API endpoint][] and/or [`octokit/request.js`][] to look up
a matching release and download the JAR distribution directly.

Pros:

- Completely transparent to the user.
- Allows managing the required Apalache version from within Quint.
- No package manager dependency like above.

Cons:

- Assumes that the JRE is installed on the local system.

*Note: We did a prototype implementation querying the GitHub REST API in [#1115](https://github.com/informalsystems/quint/issues/1115).
However, we observed CI issues due to the Github API's rate limiting as described in [#1124](https://github.com/informalsystems/quint/issues/1124). In pratice, the same issues can affect users (e.g., behind a shared IP) and may segnificantly impact UX of the `verify` command. As a countermeasure, we reverted to a hardcoded Apalache version in [`4ceb7d8`](https://github.com/informalsystems/quint/commit/4ceb7d8be824ddc0a2c2a14e105baff446f71e72).*

#### 3.2.5 Apalache as cloud-hosted SaaS

Quint uses Apalache via a public SaaS API, no local installation or management
is necessary.

Pros:

- No installation or server management issues.
- Versioning and backwards-compatiblity could be exposed via separate endpoints.

Cons:

- Relies on internet connection.
- apalache-cloud is currently not exposed via the Shai gRPC interface.
- Recurring cost for cloud hosting, likely requires billing of external users.
- May deter external users for privacy concerns.

### 3.3 Version dependencies between Quint and Apalache

We want to maintain compatiblity between Quint and Apalache, therefore we need
some mode of linking compatible versions of both tools. Both tools follow
[semantic versioning][].

The crux here is that both an upgrade and a downgrade of Apalache, relative to a
specific Quint release, may maintain or break compatibility.

Given that Quint calls Apalache, but not the other way around, it makes sense to
maintain a list of compatible Apalache versions for a given Quint release.
Broadly speaking, there are two options for maintaining such a list:

1. Informally, as part of the release notes, or other documentation.
2. Formally, inside the Quint codebase.

Moreover, there's multiple options on how to specify compatible versions:

#### 3.3.1 Use arbitrary Apalache release

We don't expect a specific Apalache release from Quint.

Pros:

- No need to manage or communicate version dependencies.

Cons:

- Things break at runtime with incompatible versions, possibly in weird places
  and with strange error messages or uncaught exceptions.

#### 3.3.2 Use latest Apalache release

Regardless of the Quint release, we expect the latest version of Apalache to be
installed. We could use the Github REST API to check the latest Apalache release
and abort if the installed version differs.

Pros:

- Easy management, no need to pin specific versions from Quint.

Cons:

- Prone to break if users have an outdated version of Quint.
  - We could address this by also checking the latest release of Quint, and
    alerting users to upgrade.
- Prone to break if users downgrade their installation of Quint.

#### 3.3.3 Pin a specific Apalache version

Each Quint release pins a specific version of Apalache.

Pros:

- Enables user to downgrade Quint, while maintaining compatibility with Apalache.

Cons:

- Users don't receive Apalache bugfix releases, unless we cut another Quint
  release that pins the updated dependency.

#### 3.3.4 Pin a minor release branch

Each Quint release pins an Apalache minor release, but allows patch-level
updates. This would correspond to a [tilde range](https://docs.npmjs.com/cli/v6/using-npm/semver#tilde-ranges-123-12-1)
`~major.minor.patch` in common package managers.

Pros:

- Users receive patch versions of Apalache while maintaining compatibility.
- Enables user to downgrade Quint, while maintaining compatibility with Apalache.

Cons:

- There may be an Apalache minor version bump that does not break compatibility
  Quint. We would need to cut another Quint release that pins the updated minor
  release.

## 4. Proposed Solution

We choose managed options for obtaining and launching Apalache from Quint, while
still providing a non-managed option:

1. To give the user more control over their system, or as a development setup,
   Quint tries to connect to an already running instance of Shai.
   - This enables launching Shai by the OS (§3.1.1), the user (§3.1.2), or – if we include a flag to point to a remote Shai instance – enables use of a remote SaaS endpoint (§3.2.5).
   - If using this option, the user is left in charge of maintaining compatible
     versions of Quint and Apalache on their system.
   - If connection fails, we fall back to the fully-managed option below.
2. If no already-running Apalache server is detected, we use a Quint-managed, on-demand instance of Shai:
   1. If not present on disk, Quint fetches a compatible Apalache release from
      Github and unpacks it into a local installation directory.  The Apalache
      version has been hardcoded in the Quint source code.
      - This can be scripted etirely from NodeJS, foregoing the need to wrap a
        third-party package manager binary.
      - Hardcoding the Apalache version is a tradeoff wrt the Github API rate limiting (see §3.2.4) – in principle, we would prefer to pin a minor release (§3.3.4) and use [Github's REST API endpoint][] and/or [`octokit/request.js`][] to determine the appropriate version.
   2. Apalache's JRE dependency is taken care of by adding a check for a `java`
      executable in `$PATH` to [the `apalache-mc` runner script](https://github.com/apalache-mc/apalache/blob/df7adb8b42b6487de9764162f338935121d07a3c/src/universal/bin/apalache-mc#L53).
      - This shall print instructions for obtaining a JRE, if none is detected.
3. Quint launches an on-demand instance of this local installation by spawning
   `apalache-mc server` in a separate process[^1].
   - Such a process is spawned for each invocation of the `verify` command, and
     torn down immediately after the RPC response.
     - This seems to be a reasonable tradeoff given Apalache's memory
       consumption and JVM startup time.
     - We can later change this to a long-lived server, if we use a more
       stateful approach of interacting with Shai (e.g., via the [transition
       explorer API][]).

[Apalache]: https://github.com/apalache-mc/apalache
[Shai]: https://github.com/apalache-mc/apalache/tree/main/shai
[transition explorer API]: https://github.com/apalache-mc/apalache/blob/df7adb8b42b6487de9764162f338935121d07a3c/docs/src/adr/010rfc-transition-explorer.md
[Github's REST API endpoint]: https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
[`octokit/request.js`]: https://github.com/octokit/request.js
[semantic versioning]: https://semver.org/

[^1]: We should also consider launching a long-running Apalache server from the
      language server, at latest when we're able to run Quint from the VSCode
      plugin.