/**
 * QStash Queue Client - Hardened Implementation
 * 
 * This module provides a null-safe, type-safe wrapper around the QStash client
 * for job scheduling. It ensures proper error handling and input validation.
 * 
 * When QSTASH_TOKEN is missing, all operations return structured failures
 * instead of throwing exceptions, making the application more resilient.
 * 
 * Compatible with Node.js and Edge runtimes (no browser globals).
 */

/**
 * Result of a publish operation
 */
export interface PublishResult {
  /** Whether the operation succeeded */
  ok: boolean;
  /** Message ID if successful */
  id?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * QStash client interface for publishing jobs
 */
interface QStashClient {
  publishJSON(params: {
    api: { name: string; baseUrl: string };
    body: Record<string, unknown>;
    delay?: string;
  }): Promise<{ messageId: string }>;
}

// Email validation regex (basic)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address
 */
function isValidEmail(email: string): boolean {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

/**
 * Validates a user ID
 */
function isValidUserId(userId: string): boolean {
  return typeof userId === "string" && userId.trim().length > 0;
}

/**
 * Validates a delay string (e.g., "1d", "30m", "60s")
 */
function isValidDelay(delay?: string): boolean {
  if (!delay) return true;
  return typeof delay === "string" && /^\d+[smhd]$/.test(delay);
}

const QSTASH_TOKEN = typeof process !== "undefined" && process?.env ? process.env.QSTASH_TOKEN : undefined;
const QSTASH_BASE_URL = typeof process !== "undefined" && process?.env ? process.env.QSTASH_BASE_URL : undefined;

let client: QStashClient | null = null;

// Initialize client only if QSTASH_TOKEN is available
if (QSTASH_TOKEN && QSTASH_TOKEN.trim().length > 0) {
  try {
    // Conditionally import @upstash/qstash if available
    // This allows the code to run even if the package is not installed
    const { Client } = require("@upstash/qstash");
    const qstashClient = new Client({ token: QSTASH_TOKEN });
    
    // Add OpenTelemetry instrumentation if available
    try {
      const { instrumentUpstash } = require("@kubiks/otel-upstash-queues");
      instrumentUpstash(qstashClient);
    } catch {
      // Instrumentation is optional, continue without it
    }
    
    client = qstashClient;
  } catch {
    // Dependencies not installed or initialization failed, will use stub
  }
}

/**
 * Stub client used when QSTASH_TOKEN is not configured
 */
const stubClient: QStashClient = {
  async publishJSON() {
    throw new Error(
      "QStash is not configured. Please set QSTASH_TOKEN environment variable."
    );
  },
};

/**
 * Safe wrapper around publishJSON that catches errors and returns PublishResult
 */
async function safePublishJSON(
  apiName: string,
  body: Record<string, unknown>,
  delay?: string
): Promise<PublishResult> {
  const activeClient = client || stubClient;
  const baseUrl = QSTASH_BASE_URL || "http://localhost:3000";

  try {
    const result = await activeClient.publishJSON({
      api: { name: apiName, baseUrl },
      body,
      delay,
    });
    
    return {
      ok: true,
      id: result.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: errorMessage,
    };
  }
}

/**
 * Schedule an email job to be processed by the email service
 * 
 * @param email - Recipient email address (must be valid format)
 * @param subject - Email subject line (must be non-empty)
 * @param delay - Optional delay string (e.g., "30m", "1h", "1d")
 * @returns PublishResult indicating success or failure
 * 
 * @example
 * ```typescript
 * const result = await scheduleEmailJob("user@example.com", "Welcome!", "5m");
 * if (result.ok) {
 *   console.log("Email job scheduled:", result.id);
 * } else {
 *   console.error("Failed to schedule email:", result.error);
 * }
 * ```
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<PublishResult> {
  // Input validation
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: "Invalid email address format",
    };
  }

  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    return {
      ok: false,
      error: "Subject must be a non-empty string",
    };
  }

  if (!isValidDelay(delay)) {
    return {
      ok: false,
      error: "Invalid delay format. Use format like '30m', '1h', or '1d'",
    };
  }

  return safePublishJSON("email", { email, subject }, delay);
}

/**
 * Schedule an analytics job to process user data
 * 
 * @param userId - User ID to process analytics for (must be non-empty)
 * @returns PublishResult indicating success or failure
 * 
 * @example
 * ```typescript
 * const result = await scheduleAnalyticsJob("user_123");
 * if (!result.ok) {
 *   console.error("Failed to schedule analytics:", result.error);
 * }
 * ```
 */
export async function scheduleAnalyticsJob(userId: string): Promise<PublishResult> {
  // Input validation
  if (!isValidUserId(userId)) {
    return {
      ok: false,
      error: "User ID must be a non-empty string",
    };
  }

  return safePublishJSON("analytics", { userId });
}

/**
 * Schedule a daily subscription check for a user
 * 
 * @param userId - User ID to check subscription for (must be non-empty)
 * @returns PublishResult indicating success or failure
 * 
 * @example
 * ```typescript
 * const result = await scheduleSubscriptionCheck("user_123");
 * if (result.ok) {
 *   console.log("Subscription check scheduled for daily execution");
 * }
 * ```
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<PublishResult> {
  // Input validation
  if (!isValidUserId(userId)) {
    return {
      ok: false,
      error: "User ID must be a non-empty string",
    };
  }

  return safePublishJSON("subscription-check", { userId }, "1d");
}

/**
 * Export the client for advanced use cases
 * Returns null if QStash is not configured
 */
export default client;
