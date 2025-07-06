import config from '../config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[config.logging.level];
  }

  private formatMessage(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;

    if (entry.level === 'error') {
      console.error(prefix, entry.message, entry.data || '', entry.error || '');
    } else if (entry.level === 'warn') {
      console.warn(prefix, entry.message, entry.data || '');
    } else if (entry.level === 'info') {
      console.info(prefix, entry.message, entry.data || '');
    } else {
      console.log(prefix, entry.message, entry.data || '');
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error,
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      entry.data = data;
    }

    if (error !== undefined) {
      entry.error = error;
    }

    return entry;
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;

    const entry = this.createLogEntry('debug', message, data);
    this.formatMessage(entry);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;

    const entry = this.createLogEntry('info', message, data);
    this.formatMessage(entry);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;

    const entry = this.createLogEntry('warn', message, data);
    this.formatMessage(entry);
  }

  error(message: string, error?: Error, data?: any): void {
    if (!this.shouldLog('error')) return;

    const entry = this.createLogEntry('error', message, data, error);
    this.formatMessage(entry);

    // In production, send to error reporting service
    if (config.features.crashReporting && config.env === 'production') {
      // TODO: Send to error reporting service
      this.sendToErrorService(entry);
    }
  }

  // API call logging
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API ${method.toUpperCase()}: ${url}`, data);
  }

  apiSuccess(method: string, url: string, responseTime?: number): void {
    const message = responseTime
      ? `API ${method.toUpperCase()} SUCCESS: ${url} (${responseTime}ms)`
      : `API ${method.toUpperCase()} SUCCESS: ${url}`;
    this.info(message);
  }

  apiError(method: string, url: string, error: Error, data?: any): void {
    this.error(`API ${method.toUpperCase()} ERROR: ${url}`, error, data);
  }

  // User action logging
  userAction(action: string, data?: any): void {
    this.info(`USER ACTION: ${action}`, data);
  }

  // Navigation logging
  navigation(from: string, to: string): void {
    this.debug(`NAVIGATION: ${from} -> ${to}`);
  }

  // Performance logging
  performance(operation: string, duration: number, data?: any): void {
    const level = duration > 1000 ? 'warn' : 'debug';
    const message = `PERFORMANCE: ${operation} took ${duration}ms`;

    if (level === 'warn') {
      this.warn(message, data);
    } else {
      this.debug(message, data);
    }
  }

  private sendToErrorService(entry: LogEntry): void {
    // Placeholder for error service integration
    // This would integrate with services like Sentry, Bugsnag, etc.
    console.log('Would send to error service:', entry);
  }
}

// Create singleton instance
const logger = new Logger();

// Convenience functions for global use
export const logDebug = (message: string, data?: any) =>
  logger.debug(message, data);
export const logInfo = (message: string, data?: any) =>
  logger.info(message, data);
export const logWarn = (message: string, data?: any) =>
  logger.warn(message, data);
export const logError = (message: string, error?: Error, data?: any) =>
  logger.error(message, error, data);

export const logApiCall = (method: string, url: string, data?: any) =>
  logger.apiCall(method, url, data);
export const logApiSuccess = (
  method: string,
  url: string,
  responseTime?: number,
) => logger.apiSuccess(method, url, responseTime);
export const logApiError = (
  method: string,
  url: string,
  error: Error,
  data?: any,
) => logger.apiError(method, url, error, data);

export const logUserAction = (action: string, data?: any) =>
  logger.userAction(action, data);
export const logNavigation = (from: string, to: string) =>
  logger.navigation(from, to);
export const logPerformance = (
  operation: string,
  duration: number,
  data?: any,
) => logger.performance(operation, duration, data);

export default logger;
