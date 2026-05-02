export type LogStack = 'frontend';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

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

export interface LogEntry {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp: string;
}

export interface LoggerConfig {
  
  baseUrl: string;
  
  token: string;
  
  minLevel?: LogLevel;
  
  batchMode?: boolean;
  
  batchIntervalMs?: number;
  
  maxBatchSize?: number;
}

export type LogFunction = (
  stack: LogStack,
  level: LogLevel,
  pkg: LogPackage,
  message: string
) => void;

export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};
