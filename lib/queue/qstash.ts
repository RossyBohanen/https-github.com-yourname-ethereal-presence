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
 * Allowed formats: <number>s (seconds), <number>m (minutes), <number>h (hours), <number>d (days)
 * Examples: "10s", "5m", "1h", "1d"
 */
function validateDelay(delay: string): void {
  const delayPattern = /^\d+[smhd]$/;
  if (!delayPattern.test(delay)) {
    throw new Error(
      `Invalid delay format: "${delay}". Expected format: <number>s|m|h|d (e.g., "10s", "5m", "1h", "1d")`
    );
  }
}

/**
 * Validate email address format.
 */
function validateEmail(email: string): void {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a non-empty string");
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error(`Invalid email format: "${email}"`);
  }
}

/**
 * Validate userId.
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string") {
    throw new Error("UserId is required and must be a non-empty string");
  }
}

/**
 * Validate subject.
 */
function validateSubject(subject: string): void {
  if (!subject || typeof subject !== "string") {
    throw new Error("Subject is required and must be a non-empty string");
  }
}

/**
 * Safe wrapper for QStash publishJSON with validation, error handling, and logging.
 * 
 * @throws Error if client is not initialized (QSTASH_TOKEN missing) or if publish fails
 */
async function safePublishJSON(params: {
  apiName: string;
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client is not initialized. QSTASH_TOKEN must be set in server environment."
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
      body: params.body,
      delay: params.delay,
      error: err,
    });
    throw err;
  }
}

/**
 * Schedule an email job with validation.
 * 
 * @param email - Recipient email address
 * @param subject - Email subject
 * @param delay - Optional delay in format: <number>s|m|h|d (e.g., "10s", "5m")
 * @throws Error if inputs are invalid, token is missing, or publish fails
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  validateEmail(email);
  validateSubject(subject);
  if (delay) {
    validateDelay(delay);
  }

  return safePublishJSON({
    apiName: "email",
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job with validation.
 * 
 * @param userId - User ID for analytics processing
 * @throws Error if userId is invalid, token is missing, or publish fails
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    apiName: "analytics",
    body: { userId },
  });
}

/**
 * Schedule a subscription check job with validation.
 * 
 * @param userId - User ID for subscription check
 * @throws Error if userId is invalid, token is missing, or publish fails
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    apiName: "subscription-check",
    body: { userId },
    delay: "1d", // Check daily
  });
}

/**
 * Export client for advanced usage.
 * Note: client may be null if QSTASH_TOKEN is not set.
 * Always check for null before using.
 */
export { client };
