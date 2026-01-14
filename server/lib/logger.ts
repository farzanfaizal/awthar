import { env } from "../config/env";

/**
 * Simple structured logging utility
 * In production, this should be replaced with a proper logging service like Winston or Pino
 * with integration to error tracking services like Sentry
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (env.IS_PRODUCTION) {
      // In production, only log warnings and errors
      return level === "warn" || level === "error";
    }
    return true; // Log everything in development
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      console.log(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.shouldLog("error")) {
      const errorContext = {
        ...context,
        ...(error instanceof Error
          ? {
              error: error.message,
              stack: error.stack,
              name: error.name,
            }
          : { error: String(error) }),
      };
      console.error(this.formatMessage("error", message, errorContext));

      // In production, send to error tracking service (Sentry, etc.)
      if (env.IS_PRODUCTION && env.SENTRY_DSN) {
        // TODO: Integrate with Sentry or other error tracking service
        // Sentry.captureException(error, { extra: context });
      }
    }
  }

  // HTTP request logging helper
  logRequest(method: string, path: string, status: number, duration: number): void {
    this.info(`${method} ${path} - ${status}`, { duration: `${duration}ms` });
  }
}

export const logger = new Logger();
