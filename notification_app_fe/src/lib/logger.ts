/**
 * Logger Integration for the Frontend App
 * 
 * Centralized logging utility — sends all log entries to the
 * evaluation service via the server-side proxy.
 * 
 * The proxy handles authentication server-side, so the logger
 * can send logs immediately without waiting for client auth.
 * 
 * Required signature: Log(stack, level, package, message)
 * NO console.log is used anywhere.
 */

/** Log severity levels */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Application package identifiers */
type LogPackage =
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

const LOG_ENDPOINT = '/api/logs';

/** Severity ordering for level filtering */
const LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * Log function matching the required signature:
 * Log(stack, level, package, message)
 */
type LogFunction = (
  stack: 'frontend',
  level: LogLevel,
  pkg: LogPackage,
  message: string
) => void;

/**
 * Logger class — centralized logging for the frontend application.
 * Sends all logs to the server-side proxy which handles auth.
 * NO console.log is used anywhere.
 */
class FrontendLogger {
  private minLevel: LogLevel = 'debug';

  /**
   * Set the minimum log level.
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Set the auth token (kept for backward compatibility, but no longer needed).
   * The server-side proxy handles authentication for logs.
   */
  setToken(_token: string): void {
    // No-op: server-side proxy handles auth for logs
  }

  /**
   * Primary log method matching the required signature:
   * Log(stack, level, package, message)
   */
  log: LogFunction = (
    stack: 'frontend',
    level: LogLevel,
    pkg: LogPackage,
    message: string
  ): void => {
    if (LEVEL_SEVERITY[level] < LEVEL_SEVERITY[this.minLevel]) {
      return;
    }

    const entry = {
      stack,
      level,
      package: pkg,
      message: message.length > 48 ? message.substring(0, 45) + '...' : message,
      timestamp: new Date().toISOString(),
    };

    // Send immediately — server proxy handles auth
    this.sendLog(entry);
  };

  /** Convenience: debug level */
  debug = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'debug', pkg, message);

  /** Convenience: info level */
  info = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'info', pkg, message);

  /** Convenience: warn level */
  warn = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'warn', pkg, message);

  /** Convenience: error level */
  error = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'error', pkg, message);

  /** Convenience: fatal level */
  fatal = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'fatal', pkg, message);

  /**
   * Send a log entry to the server-side proxy.
   * The proxy authenticates with the evaluation service.
   */
  private async sendLog(entry: Record<string, string>): Promise<void> {
    try {
      await fetch(LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently handle network errors — no console.log allowed
    }
  }
}

/** Singleton logger instance */
export const logger = new FrontendLogger();

/**
 * Standalone Log function matching the exact required signature.
 * Can be imported and called directly:
 *   Log('frontend', 'info', 'api', 'Fetched notifications');
 */
export const Log: LogFunction = (stack, level, pkg, message) => {
  logger.log(stack, level, pkg, message);
};
