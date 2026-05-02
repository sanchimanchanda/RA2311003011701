/**
 * Core Logger Implementation
 * 
 * Centralized logging utility that sends all log entries to the
 * evaluation service API. Supports both immediate and batched modes.
 * 
 * Usage:
 *   import { createLogger } from 'logging-middleware';
 *   const logger = createLogger({ baseUrl: '...', token: '...' });
 *   logger.log('frontend', 'info', 'api', 'Fetched notifications');
 */

import {
  LogStack,
  LogLevel,
  LogPackage,
  LogEntry,
  LoggerConfig,
  LogFunction,
  LOG_LEVEL_SEVERITY,
} from './types';

/** Default configuration values */
const DEFAULTS = {
  MIN_LEVEL: 'debug' as LogLevel,
  BATCH_INTERVAL_MS: 5000,
  MAX_BATCH_SIZE: 50,
  LOG_ENDPOINT: '/evaluation-service/logs',
} as const;

/**
 * Logger class — the core of the logging middleware.
 * 
 * Provides a type-safe `log()` method that sends structured log entries
 * to the evaluation service. Supports batching to reduce network overhead.
 */
export class Logger {
  private readonly config: Required<LoggerConfig>;
  private batch: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;

  constructor(config: LoggerConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      token: config.token,
      minLevel: config.minLevel ?? DEFAULTS.MIN_LEVEL,
      batchMode: config.batchMode ?? false,
      batchIntervalMs: config.batchIntervalMs ?? DEFAULTS.BATCH_INTERVAL_MS,
      maxBatchSize: config.maxBatchSize ?? DEFAULTS.MAX_BATCH_SIZE,
    };

    if (this.config.batchMode) {
      this.startBatchTimer();
    }
  }

  /**
   * Update the bearer token (e.g., after token refresh).
   */
  public updateToken(token: string): void {
    (this.config as LoggerConfig).token = token;
  }

  /**
   * Primary log method.
   * 
   * @param stack - Application stack ('frontend')
   * @param level - Severity level
   * @param pkg - Source package/module
   * @param message - Log message
   */
  public log: LogFunction = (
    stack: LogStack,
    level: LogLevel,
    pkg: LogPackage,
    message: string
  ): void => {
    // Filter by minimum level
    if (LOG_LEVEL_SEVERITY[level] < LOG_LEVEL_SEVERITY[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      stack,
      level,
      package: pkg,
      message,
      timestamp: new Date().toISOString(),
    };

    if (this.config.batchMode) {
      this.batch.push(entry);
      if (this.batch.length >= this.config.maxBatchSize) {
        this.flush();
      }
    } else {
      this.sendLog(entry);
    }
  };

  /**
   * Convenience methods for each log level.
   */
  public debug = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'debug', pkg, message);

  public info = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'info', pkg, message);

  public warn = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'warn', pkg, message);

  public error = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'error', pkg, message);

  public fatal = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'fatal', pkg, message);

  /**
   * Flush the batch queue immediately.
   */
  public async flush(): Promise<void> {
    if (this.batch.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const entries = [...this.batch];
    this.batch = [];

    try {
      await Promise.all(entries.map((entry) => this.sendLog(entry)));
    } catch {
      // Re-queue failed entries at the front
      this.batch = [...entries, ...this.batch];
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Destroy the logger, flushing remaining logs and clearing timers.
   */
  public async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  /**
   * Send a single log entry to the evaluation service.
   */
  private async sendLog(entry: LogEntry): Promise<void> {
    const url = `${this.config.baseUrl}${DEFAULTS.LOG_ENDPOINT}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.token}`,
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        // Intentionally NOT using console.log — errors are silently dropped
        // or could be pushed to a fallback queue in production
      }
    } catch {
      // Network error — silently handled
      // In production, implement retry with exponential backoff
    }
  }

  /**
   * Start the periodic batch flush timer.
   */
  private startBatchTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.batchIntervalMs);
  }
}

/**
 * Factory function to create a configured Logger instance.
 * 
 * @param config - Logger configuration
 * @returns Configured Logger instance
 */
export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}

/**
 * Standalone Log function matching the required signature:
 * Log(stack, level, package, message)
 * 
 * This requires a pre-configured logger instance.
 */
export function createLogFunction(config: LoggerConfig): LogFunction {
  const logger = new Logger(config);
  return logger.log;
}
