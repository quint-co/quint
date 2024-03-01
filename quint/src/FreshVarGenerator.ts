/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Generation of fresh variables with a given prefix.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

export class FreshVarGenerator {
  private freshVarCounters: Map<string, number> = new Map<string, number>()

  freshVar(prefix: string): string {
    const counter = this.freshVarCounters.get(prefix) ?? 0
    this.freshVarCounters.set(prefix, counter + 1)

    return `${prefix}${counter}`
  }
}
