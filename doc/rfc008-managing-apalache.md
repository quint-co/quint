# RFC008: Obtaining and Launching Apalache from Quint

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 2023-08-09 | Thomas Pani      |

## 1. Summary

This RFC presents options on how to obtain and manage Apalache for use with
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
this document to survey options, and to list advantages and disadvantages.

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
a freshly launched `apalache-mc server` takes ~125MB of memory, while JVM
startup time is negligable (< 2sec).

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

- Invoking the system-level package manager from Quint (see §3.2.1)
- Invoking an ecosystem package manager from Quint (see §3.2.2)
- Pull the Apalache distribution from Github (see §3.2.3), e.g. using
  [Github's REST API endpoint][] and/or [`octokit/request.js`][]

Pros:

- Completely transparent to the user.
- Allows managing the required Apalache version from within Quint.

Cons:

- Only pushes the boundary: e.g., this would assume that npm, coursier, or the
  JRE are installed on the local system. `vscode-metals` includes a
  `coursier` binary in its distribution to counter this.
- Spawning a package manager increases complexity by running a process whose
  behavior is outside of our control.

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

How do we manage version depenedencies between Quint and Apalache?

_TBD: this depends heavily on the solution to §3.1 and §3.2, and should be
determined after we reach consensus on those points._

## 4. Proposed Solution

We choose managed options for obtaining and launching Apalache from Quint, while
still providing a non-managed option:

1. Primarily, Quint uses a Quint-managed, on-demand instance of Shai:
   1. If not present, Quint fetches a compatible Apalache release from Github,
      using [Github's REST API endpoint][] and/or [`octokit/request.js`][] and
      unpacks it into a local installation directory.
      - This can be scripted etirely from NodeJS, foregoing the need to wrap a
        third-party package manager binary.
   2. Apalache's JRE dependency is taken care of by adding a check for a `java`
      executable in `$PATH` to [the `apalache-mc` runner script](https://github.com/informalsystems/apalache/blob/df7adb8b42b6487de9764162f338935121d07a3c/src/universal/bin/apalache-mc#L53).
      - This shall print instructions for obtaining a JRE, if none is detected.
2. Quint launches an on-demand instance of this local installation by spawning
   `apalache-mc server` in a separate process[^1].
   - Such a process is spawned for each invocation of the `verify` command, and
     torn down immediately after the RPC response.
     - This seems to be a reasonable tradeoff given Apalache's memory
       consumption and JVM startup time.
     - We can later change this to a long-lived server, if we use a more
       stateful approach of interacting with Shai (e.g., via the [transition
       explorer API][]).
3. To give the user more control over their system, or as a development setup,
   we provide a CLI flag and/or config file option, pointing Quint to a socket
   exposing Shai (e.g., `--shai='my.shai.server:4242'`).
   - If this flag or option is set, Quint skips the managed approach above and
     instead connects to the provided socket and uses this instance of Apalache to
     dispatch verification commands.
   - This enables launching Shai by the OS (§3.1.1), the user (§3.1.2), or to
     enable a remote SaaS endpoint (§3.2.5).
   - If using this option, the user is left in charge of maintaining compatible
     versions of Quint and Apalache on their system.
   - Instead of using a flag or option, we could expose this path via fall-back
     behavior (i.e., try to connect to a socket first, and if that fails proceed
     to the managed approach above).

[Apalache]: https://github.com/informalsystems/apalache
[Shai]: https://github.com/informalsystems/apalache/tree/main/shai
[transition explorer API]: https://github.com/informalsystems/apalache/blob/df7adb8b42b6487de9764162f338935121d07a3c/docs/src/adr/010rfc-transition-explorer.md
[Github's REST API endpoint]: https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
[`octokit/request.js`]: https://github.com/octokit/request.js

[^1]: We should also consider launching a long-running Apalache server from the
      language server, at latest when we're able to run Quint from the VSCode
      plugin.