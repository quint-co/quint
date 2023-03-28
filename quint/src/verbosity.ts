/*
 * The place where the verbosity settings are checked.
 * Instead of checking verbosity levels by hand, use the helper functions
 * of the object 'verbosity'.
 *
 * Igor Konnov, Informal Systems, 2023
 *
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

export const verbosity = {
  /**
   * The maximal verbosity level.
   */
  maxVerbosity: 5,

  /**
   * Shall the tool output the execution results.
   */
  hasResults: (level: number): boolean => {
    return level >= 1
  },

  /**
   * Shall the tool write hints, e.g., how to change settings.
   */
  hasHints: (level: number): boolean => {
    return level >= 2
  },

  /**
   * Shall the tool output states, e.g., in counterexamples.
   */
  hasStateOutput: (level: number): boolean => {
    return level >= 2
  },

  /**
   * Shall the tool track and output actions that were executed.
   */
  hasActionTracking: (level: number): boolean => {
    return level >= 3
  },

  /**
   * Shall the tool track and output user-defined operators (not only actions).
   */
  hasUserOpTracking: (level: number): boolean => {
    return level >= 3
  },
}
