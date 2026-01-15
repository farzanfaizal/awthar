/**
 * Standardized error handling for API responses
 * Ensures consistent error format across all endpoints
 */

import { Response } from "express";
import { ZodError } from "zod";
import { logger } from "./logger";

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
    statusCode: number;
  };
}

/**
 * Custom application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * Format Zod validation errors into user-friendly format
 */
function formatZodError(error: ZodError): any {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}

/**
 * Send standardized error response
 */
export function sendErrorResponse(
  res: Response,
  error: Error | AppError,
  context?: Record<string, any>
): void {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const response: ApiErrorResponse = {
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: formatZodError(error),
        statusCode: 422,
      },
    };

    logger.warn("Validation error", { details: response.error.details, ...context });
    res.status(422).json(response);
    return;
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    const response: ApiErrorResponse = {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
        statusCode: error.statusCode,
      },
    };

    // Log based on severity
    if (error.statusCode >= 500) {
      logger.error("Application error", error, { ...response.error, ...context });
    } else {
      logger.warn("Client error", { ...response.error, ...context });
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle unexpected errors
  const statusCode = 500;
  const response: ApiErrorResponse = {
    error: {
      message: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode,
    },
  };

  logger.error("Unexpected error", error, context);

  // In development, include error details
  if (process.env.NODE_ENV === "development") {
    response.error.details = {
      message: error.message,
      stack: error.stack,
    };
  }

  res.status(statusCode).json(response);
}

/**
 * Async handler wrapper to catch errors
 */
export function asyncHandler(
  fn: (req: any, res: Response, next?: any) => Promise<any>
) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      sendErrorResponse(res, error, {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
      });
    });
  };
}
