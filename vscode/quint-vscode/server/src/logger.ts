/**
 * Logging utility providing configurable log levels and output redirection.
 *
 * @module logger
 */
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as util from 'util'
import { isMainThread } from 'worker_threads'

/**
 * Defines available log levels.
 */
type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'ERROR' | 'WARN' | 'NONE'

/**
 * Reads the log level from the environment variable `LOG_LEVEL`.
 * Defaults to 'NONE' if not set.
 */
const LOG_LEVEL = (process.env.LOG_LEVEL || 'NONE').toUpperCase() as LogLevel

/**
 * Numeric mapping for log level hierarchy.
 */
const logLevels: Record<LogLevel, number> = {
  TRACE: 3,
  DEBUG: 2,
  INFO: 1,
  WARN: 1,
  ERROR: 1,
  NONE: 0,
}

/**
 * Path to the log file. Defaults to user's home directory or `/tmp`. Uses
 * separate files for main thread and worker to avoid concurrent write issues.
 */
const logFile = path.join(
  process.env.HOME ?? // Unix-like systems
    process.env.USERPROFILE ?? // Windows
    os.tmpdir(), // Fallback to system temp directory
  isMainThread ? 'quint-lsp.log' : 'quint-lsp-worker.log'
)

/**
 * Writable stream to append log messages.
 */
const logStream = fs.createWriteStream(logFile, { flags: 'a' })

/**
 * Generates an ISO timestamp formatted for logging.
 *
 * @returns {string} Timestamp in `YYYY-MM-DD HH:mm:ss.SSS` format.
 */
const getTimestamp = (): string => new Date().toISOString().replace('T', ' ').replace('Z', '')

/**
 * Check if the given log level is enabled.
 */
export function isEnabled(level: LogLevel) {
  return logLevels[LOG_LEVEL] >= logLevels[level]
}

/**
 * Writes a formatted log message if the current log level permits.
 *
 * @param level - Severity of the log message.
 * @param args - Message arguments to log.
 */
function writeLog(level: LogLevel, ...args: any[]) {
  if (isEnabled(level)) {
    const message = `[${getTimestamp()}] [${level}] ${util.format(...args)}`
    logStream.write(message + '\n')
  }
}

/**
 * Logger object providing methods for various log levels.
 */
export const logger = {
  trace: (...args: any[]) => writeLog('TRACE', ...args),
  debug: (...args: any[]) => writeLog('DEBUG', ...args),
  info: (...args: any[]) => writeLog('INFO', ...args),
  warn: (...args: any[]) => writeLog('WARN', ...args),
  error: (...args: any[]) => writeLog('ERROR', ...args),
}

/**
 * Overrides global console log methods, with the logger's methods.
 */
export function overrideConsole() {
  console.trace = logger.trace
  console.debug = logger.debug
  console.info = logger.info
  console.log = logger.info
  console.warn = logger.warn
  console.error = logger.error
}
