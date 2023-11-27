/*
 * The place where the verbosity settings are checked.
 * Instead of checking verbosity levels by hand, use the helper functions
 * of the object 'verbosity'.
 *
 * Igor Konnov, Informal Systems, 2023
 *
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

export const verbosity = {
  /**
   * The default verbosity level.
   */
  defaultLevel: 2,

  /**
   * The maximal verbosity level.
   */
  maxVerbosity: 5,

  /**
   * Shall REPL show the prompts like '>>> ' and '... '?
   */
  hasReplPrompt: (level: number): boolean => {
    return level > 0
  },

  /**
   * Shall REPL show the banner?
   */
  hasReplBanners: (level: number): boolean => {
    return level > 0
  },

  /**
   * Shall the tool output the execution results.
   */
  hasResults: (level: number): boolean => {
    return level >= 1
  },

  /**
   * Shall the tool output details about failing tests.
   */
  hasTestDetails: (level: number): boolean => {
    return level >= 2
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

  /**
   * Shall the tool output debug info.
   */
  hasDebugInfo: (level: number): boolean => {
    return level >= 4
  },
}
