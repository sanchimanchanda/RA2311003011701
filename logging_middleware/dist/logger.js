"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.createLogger = createLogger;
exports.createLogFunction = createLogFunction;
const types_1 = require("./types");
/** Default configuration values */
const DEFAULTS = {
    MIN_LEVEL: 'debug',
    BATCH_INTERVAL_MS: 5000,
    MAX_BATCH_SIZE: 50,
    LOG_ENDPOINT: '/evaluation-service/logs',
};
/**
 * Logger class — the core of the logging middleware.
 *
 * Provides a type-safe `log()` method that sends structured log entries
 * to the evaluation service. Supports batching to reduce network overhead.
 */
class Logger {
    constructor(config) {
        this.batch = [];
        this.flushTimer = null;
        this.isFlushing = false;
        /**
         * Primary log method.
         *
         * @param stack - Application stack ('frontend')
         * @param level - Severity level
         * @param pkg - Source package/module
         * @param message - Log message
         */
        this.log = (stack, level, pkg, message) => {
            // Filter by minimum level
            if (types_1.LOG_LEVEL_SEVERITY[level] < types_1.LOG_LEVEL_SEVERITY[this.config.minLevel]) {
                return;
            }
            const entry = {
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
            }
            else {
                this.sendLog(entry);
            }
        };
        /**
         * Convenience methods for each log level.
         */
        this.debug = (pkg, message) => this.log('frontend', 'debug', pkg, message);
        this.info = (pkg, message) => this.log('frontend', 'info', pkg, message);
        this.warn = (pkg, message) => this.log('frontend', 'warn', pkg, message);
        this.error = (pkg, message) => this.log('frontend', 'error', pkg, message);
        this.fatal = (pkg, message) => this.log('frontend', 'fatal', pkg, message);
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
    updateToken(token) {
        this.config.token = token;
    }
    /**
     * Flush the batch queue immediately.
     */
    async flush() {
        if (this.batch.length === 0 || this.isFlushing)
            return;
        this.isFlushing = true;
        const entries = [...this.batch];
        this.batch = [];
        try {
            await Promise.all(entries.map((entry) => this.sendLog(entry)));
        }
        catch {
            // Re-queue failed entries at the front
            this.batch = [...entries, ...this.batch];
        }
        finally {
            this.isFlushing = false;
        }
    }
    /**
     * Destroy the logger, flushing remaining logs and clearing timers.
     */
    async destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        await this.flush();
    }
    /**
     * Send a single log entry to the evaluation service.
     */
    async sendLog(entry) {
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
        }
        catch {
            // Network error — silently handled
            // In production, implement retry with exponential backoff
        }
    }
    /**
     * Start the periodic batch flush timer.
     */
    startBatchTimer() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config.batchIntervalMs);
    }
}
exports.Logger = Logger;
/**
 * Factory function to create a configured Logger instance.
 *
 * @param config - Logger configuration
 * @returns Configured Logger instance
 */
function createLogger(config) {
    return new Logger(config);
}
/**
 * Standalone Log function matching the required signature:
 * Log(stack, level, package, message)
 *
 * This requires a pre-configured logger instance.
 */
function createLogFunction(config) {
    const logger = new Logger(config);
    return logger.log;
}
//# sourceMappingURL=logger.js.map