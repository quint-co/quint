/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * `quint veil`: what the Veil backend of `quint verify` installs, set up ahead of
 * the first check, or asked about.
 *
 * @module
 */

import { Argv, CommandModule } from 'yargs'
import { VEIL_OUTPUT_VERBOSITY, ensureVeil, veilStatus } from './veil'

export const veilCmd: CommandModule = {
  command: 'veil',
  describe: 'set up Veil, which `quint verify --backend veil` runs, or tell whether it is ready',
  builder: (yargs: Argv) =>
    yargs
      .command({
        command: 'status',
        describe: 'print where Veil is installed; exits with 0 when it is ready to check specs, 1 when not',
        handler: () => {
          const status = veilStatus()
          if (status.isLeft()) {
            console.error(`error: ${status.value}`)
            process.exitCode = 1
          } else {
            const { ready, workspace } = status.value
            console.log(ready ? `ready ${workspace}` : `not installed ${workspace}`)
            process.exitCode = ready ? 0 : 1
          }
        },
      })
      .command({
        command: 'install',
        describe: 'install elan, Lean, Veil and the Quint library for Lean, and build them, unless already done',
        handler: async () => {
          const workspace = await ensureVeil(VEIL_OUTPUT_VERBOSITY)
          if (workspace.isLeft()) {
            console.error(`error: ${workspace.value}`)
            process.exitCode = 1
          } else {
            console.log(`ready ${workspace.value.dir}`)
          }
        },
      })
      .demandCommand(1),
  handler: () => {},
}
