/**
 * Secure error handling utilities.
 * Prevents exposing stack traces and internal error details to users.
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Generic user-facing error messages.
 * Maps internal error types to safe, user-friendly messages.
 */
const USER_MESSAGES: Record<string, string> = {
  ValidationError: "The provided data is invalid. Please check your input.",
  AuthenticationError: "Authentication failed. Please try again.",
  AuthorizationError: "You don't have permission to perform this action.",
  NotFoundError: "The requested resource was not found.",
  RateLimitError: "Too many requests. Please try again later.",
  DatabaseError: "A database error occurred. Please try again.",
  EmailError: "Failed to send email. Please try again.",
  PaymentError: "Payment processing failed. Please try again.",
  default: "An unexpected error occurred. Please try again later.",
};

/**
 * Custom error class with error code for categorization.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "default",
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Creates a safe error response for users.
 * In production, hides internal details; in development, includes full error info.
 */
export function createSafeErrorResponse(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
} {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      message: isProduction
        ? USER_MESSAGES[error.code] || USER_MESSAGES.default
        : error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Log the full error server-side
    console.error("[Error]", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return {
      message: isProduction ? USER_MESSAGES.default : error.message,
      code: "default",
      statusCode: 500,
    };
  }

  // Handle unknown error types
  console.error("[Unknown Error]", error);
  return {
    message: USER_MESSAGES.default,
    code: "default",
    statusCode: 500,
  };
}

/**
 * Wraps an async handler to catch and safely handle errors.
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const safeError = createSafeErrorResponse(error);
      throw new AppError(safeError.message, safeError.code, safeError.statusCode);
    }
  }) as T;
}

/**
 * Logs security-relevant events for monitoring.
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>
): void {
  console.info("[Security Event]", {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
}
