import { Client } from "@upstash/qstash";
import { instrumentUpstash } from "@kubiks/otel-upstash-queues";

/**
 * Server-only QStash wrapper
 *
 * Notes:
 * - QSTASH_TOKEN must only be set in server-only environments (serverless runtime, not edge or browser).
 * - This module avoids initializing a client when QSTASH_TOKEN is missing so callers get a clear error instead of an NPE.
 * - All publish calls go through safePublishJSON which performs input validation and structured logging on failure.
 */

const QSTASH_TOKEN = process.env.QSTASH_TOKEN || "";
const QSTASH_BASE_URL = process.env.QSTASH_BASE_URL || "http://localhost:3000";

// Only create a client when token is present
const client: Client | null = QSTASH_TOKEN ? new Client({ token: QSTASH_TOKEN }) : null;

// Instrument only when client exists
if (client) {
  try {
    instrumentUpstash(client);
  } catch (err) {
    // Non-fatal instrumentation failure — log for diagnostics
    // eslint-disable-next-line no-console
    console.warn("instrumentUpstash failed", err);
  }
}

/**
 * Validate a human-friendly delay string.
 * Allowed formats: "10s", "5m", "1h", "1d" (seconds, minutes, hours, days)
 * @param delay - The delay string to validate
 * @returns true if valid, false otherwise
 */
function isValidDelay(delay: string): boolean {
  if (!delay || typeof delay !== "string") return false;
  // Match pattern: number followed by s, m, h, or d
  return /^\d+[smhd]$/.test(delay);
}

/**
 * Validate email format
 * @param email - The email to validate
 * @returns true if valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate userId (non-empty string)
 * @param userId - The userId to validate
 * @returns true if valid, false otherwise
 */
function isValidUserId(userId: string): boolean {
  return typeof userId === "string" && userId.trim().length > 0;
}

/**
 * Validate subject (non-empty string)
 * @param subject - The subject to validate
 * @returns true if valid, false otherwise
 */
function isValidSubject(subject: string): boolean {
  return typeof subject === "string" && subject.trim().length > 0;
}

/**
 * Safe wrapper for publishJSON that ensures client exists and provides error handling.
 * @param params - The parameters for publishing
 * @returns The message ID from QStash
 * @throws Error if client is not initialized or if publishing fails
 */
async function safePublishJSON(params: {
  apiName: string;
  body: Record<string, any>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client is not initialized. QSTASH_TOKEN must be set in server-only environment."
    );
  }

  try {
    const messageId = await client.publishJSON({
      api: {
        name: params.apiName,
        baseUrl: QSTASH_BASE_URL,
      },
      body: params.body,
      delay: params.delay,
    });
    return messageId;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("QStash publish failed", {
      apiName: params.apiName,
      payload: params.body,
      error: err,
    });
    throw err;
  }
}

/**
 * Schedule an email job via QStash.
 * @param email - The recipient email address (must be valid)
 * @param subject - The email subject (required, non-empty)
 * @param delay - Optional delay in format: "10s", "5m", "1h", "1d"
 * @returns The message ID from QStash
 * @throws Error if inputs are invalid or QSTASH_TOKEN is not set
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email address: ${email}`);
  }
  if (!isValidSubject(subject)) {
    throw new Error("Subject is required and must be non-empty");
  }
  if (delay && !isValidDelay(delay)) {
    throw new Error(
      `Invalid delay format: ${delay}. Expected format: "10s", "5m", "1h", "1d"`
    );
  }

  return safePublishJSON({
    apiName: "email",
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job via QStash.
 * @param userId - The user ID (required, non-empty)
 * @returns The message ID from QStash
 * @throws Error if userId is invalid or QSTASH_TOKEN is not set
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  if (!isValidUserId(userId)) {
    throw new Error("userId is required and must be non-empty");
  }

  return safePublishJSON({
    apiName: "analytics",
    body: { userId },
  });
}

/**
 * Schedule a subscription check job via QStash.
 * @param userId - The user ID (required, non-empty)
 * @returns The message ID from QStash
 * @throws Error if userId is invalid or QSTASH_TOKEN is not set
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  if (!isValidUserId(userId)) {
    throw new Error("userId is required and must be non-empty");
  }

  return safePublishJSON({
    apiName: "subscription-check",
    body: { userId },
    delay: "1d", // Check daily
  });
}

/**
 * Export the client for advanced usage.
 * WARNING: May be null if QSTASH_TOKEN is not set.
 * Always check for null before using.
 */
export { client };

/**
 * Default export for backward compatibility (may be null)
 */
export default client;
