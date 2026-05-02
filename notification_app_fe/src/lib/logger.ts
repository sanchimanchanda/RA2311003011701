type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

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

const LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

type LogFunction = (
  stack: 'frontend',
  level: LogLevel,
  pkg: LogPackage,
  message: string
) => void;

class FrontendLogger {
  private minLevel: LogLevel = 'debug';

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  setToken(_token: string): void {
    // No-op: server-side proxy handles auth for logs
  }

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

  debug = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'debug', pkg, message);

  info = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'info', pkg, message);

  warn = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'warn', pkg, message);

  error = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'error', pkg, message);

  fatal = (pkg: LogPackage, message: string): void =>
    this.log('frontend', 'fatal', pkg, message);

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

export const logger = new FrontendLogger();

export const Log: LogFunction = (stack, level, pkg, message) => {
  logger.log(stack, level, pkg, message);
};
