/**
 * Logging Middleware Type Definitions
 * 
 * Type-safe definitions for the centralized logging system.
 * All log entries are sent to the evaluation service API.
 */

/** Application stack identifier */
export type LogStack = 'frontend';

/** Log severity levels in ascending order of severity */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Application package/module identifiers */
export type LogPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style'
  | 'auth'
  | 'config'
  | 'middleware'
  | 'utils';

/** Structure of a log entry sent to the API */
export interface LogEntry {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp: string;
}

/** Configuration for the logger */
export interface LoggerConfig {
  /** Base URL of the evaluation service */
  baseUrl: string;
  /** Bearer token for authentication */
  token: string;
  /** Minimum log level to process (default: 'debug') */
  minLevel?: LogLevel;
  /** Enable batch mode (default: false) */
  batchMode?: boolean;
  /** Batch flush interval in ms (default: 5000) */
  batchIntervalMs?: number;
  /** Maximum batch size before auto-flush (default: 50) */
  maxBatchSize?: number;
}

/** Log function signature */
export type LogFunction = (
  stack: LogStack,
  level: LogLevel,
  pkg: LogPackage,
  message: string
) => void;

/** Severity weight map for level filtering */
export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};
