import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
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
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
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
  constructor(message: string, details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * Format Zod validation errors into user-friendly format
 */
function formatZodError(error: ZodError): unknown {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * Handle any error and return a proper NextResponse
 * Use this in catch blocks of route handlers
 */
export function handleApiError(error: unknown, context?: Record<string, unknown>): NextResponse<ApiErrorResponse> {
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
    return NextResponse.json(response, { status: 422 });
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

    if (error.statusCode >= 500) {
      logger.error("Application error", error, { ...response.error, ...context });
    } else {
      logger.warn("Client error", { ...response.error, ...context });
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle unexpected errors
  const response: ApiErrorResponse = {
    error: {
      message: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    },
  };

  logger.error("Unexpected error", error instanceof Error ? error : new Error(String(error)), context);

  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    response.error.details = { message: error.message, stack: error.stack };
  }

  return NextResponse.json(response, { status: 500 });
}
