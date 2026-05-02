import {
  LogStack,
  LogLevel,
  LogPackage,
  LogEntry,
  LoggerConfig,
  LogFunction,
  LOG_LEVEL_SEVERITY,
} from './types';

const DEFAULTS = {
  MIN_LEVEL: 'debug' as LogLevel,
  BATCH_INTERVAL_MS: 5000,
  MAX_BATCH_SIZE: 50,
  LOG_ENDPOINT: '/evaluation-service/logs',
} as const;

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

  public updateToken(token: string): void {
    (this.config as LoggerConfig).token = token;
  }

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

  public async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

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

  private startBatchTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.batchIntervalMs);
  }
}

export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}

export function createLogFunction(config: LoggerConfig): LogFunction {
  const logger = new Logger(config);
  return logger.log;
}
