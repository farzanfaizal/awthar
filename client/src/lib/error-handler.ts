/**
 * Client-side error handling utilities
 * Provides structured logging and error reporting for production
 */

/**
 * Log levels
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Error reporting service (can be integrated with Sentry, LogRocket, etc.)
 */
class ErrorHandler {
  private isProduction = import.meta.env.PROD;

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: Record<string, any>): void {
    if (!this.isProduction) {
      console.log(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log informational message
   */
  info(message: string, context?: Record<string, any>): void {
    if (!this.isProduction) {
      console.log(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log warning (always logged)
   */
  warn(message: string, context?: Record<string, any>): void {
    if (this.isProduction) {
      // In production, send to error tracking service
      // TODO: Integrate with Sentry or similar
      // Sentry.captureMessage(message, 'warning', { extra: context });
    } else {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Log error (always logged and reported)
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const errorDetails = {
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (this.isProduction) {
      // In production, send to error tracking service
      // TODO: Integrate with Sentry or similar
      // Sentry.captureException(error || new Error(message), { extra: errorDetails });
    } else {
      console.error(`[ERROR] ${message}`, errorDetails);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}

export const errorHandler = new ErrorHandler();
