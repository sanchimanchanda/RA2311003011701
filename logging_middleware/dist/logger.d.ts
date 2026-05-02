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
import { LogPackage, LoggerConfig, LogFunction } from './types';
/**
 * Logger class — the core of the logging middleware.
 *
 * Provides a type-safe `log()` method that sends structured log entries
 * to the evaluation service. Supports batching to reduce network overhead.
 */
export declare class Logger {
    private readonly config;
    private batch;
    private flushTimer;
    private isFlushing;
    constructor(config: LoggerConfig);
    /**
     * Update the bearer token (e.g., after token refresh).
     */
    updateToken(token: string): void;
    /**
     * Primary log method.
     *
     * @param stack - Application stack ('frontend')
     * @param level - Severity level
     * @param pkg - Source package/module
     * @param message - Log message
     */
    log: LogFunction;
    /**
     * Convenience methods for each log level.
     */
    debug: (pkg: LogPackage, message: string) => void;
    info: (pkg: LogPackage, message: string) => void;
    warn: (pkg: LogPackage, message: string) => void;
    error: (pkg: LogPackage, message: string) => void;
    fatal: (pkg: LogPackage, message: string) => void;
    /**
     * Flush the batch queue immediately.
     */
    flush(): Promise<void>;
    /**
     * Destroy the logger, flushing remaining logs and clearing timers.
     */
    destroy(): Promise<void>;
    /**
     * Send a single log entry to the evaluation service.
     */
    private sendLog;
    /**
     * Start the periodic batch flush timer.
     */
    private startBatchTimer;
}
/**
 * Factory function to create a configured Logger instance.
 *
 * @param config - Logger configuration
 * @returns Configured Logger instance
 */
export declare function createLogger(config: LoggerConfig): Logger;
/**
 * Standalone Log function matching the required signature:
 * Log(stack, level, package, message)
 *
 * This requires a pre-configured logger instance.
 */
export declare function createLogFunction(config: LoggerConfig): LogFunction;
//# sourceMappingURL=logger.d.ts.map