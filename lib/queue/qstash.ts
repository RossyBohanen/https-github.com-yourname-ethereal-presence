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
 * Allowed formats: Xs, Xm, Xh, Xd (where X is a positive integer > 0)
 * Examples: "10s" (10 seconds), "5m" (5 minutes), "1h" (1 hour), "1d" (1 day)
 */
function validateDelay(delay: string): void {
  const delayPattern = /^(\d+)(s|m|h|d)$/;
  const match = delay.match(delayPattern);
  if (!match) {
    throw new Error(
      `Invalid delay format: "${delay}". Expected format: <number><unit> where unit is s, m, h, or d (e.g., "10s", "5m", "1h", "1d")`
    );
  }
  const value = parseInt(match[1], 10);
  if (value === 0) {
    throw new Error(
      `Invalid delay value: "${delay}". Delay must be greater than zero.`
    );
  }
}

/**
 * Validate email format
 */
function validateEmail(email: string): void {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a string");
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error(`Invalid email format: "${email}"`);
  }
}

/**
 * Validate userId
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string") {
    throw new Error("UserId is required and must be a non-empty string");
  }
}

/**
 * Validate subject
 */
function validateSubject(subject: string): void {
  if (!subject || typeof subject !== "string") {
    throw new Error("Subject is required and must be a non-empty string");
  }
}

/**
 * Safe wrapper around client.publishJSON with error handling and validation.
 * Ensures the client exists, catches and logs errors with payload context, and rethrows for callers to handle.
 */
async function safePublishJSON(params: {
  apiName: string;
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client is not initialized. QSTASH_TOKEN must be set in server-only environment."
    );
  }

  // Validate delay if provided
  if (params.delay) {
    validateDelay(params.delay);
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
    // Log error with context for debugging
    // Note: Avoid logging full body as it may contain sensitive data
    // eslint-disable-next-line no-console
    console.error("QStash publishJSON failed", {
      apiName: params.apiName,
      delay: params.delay,
      error: err,
    });
    // Rethrow for callers to handle
    throw err;
  }
}

// Export client (may be null) for advanced usage
export { client };

/**
 * Schedule an email job.
 * @param email - Email address to send to (validated)
 * @param subject - Email subject (validated)
 * @param delay - Optional delay in format: Xs, Xm, Xh, or Xd (validated)
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  validateEmail(email);
  validateSubject(subject);

  return safePublishJSON({
    apiName: "email",
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job.
 * @param userId - User identifier (validated)
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    apiName: "analytics",
    body: { userId },
  });
}

/**
 * Schedule a subscription check job (runs daily).
 * @param userId - User identifier (validated)
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    apiName: "subscription-check",
    body: { userId },
    delay: "1d", // Check daily
  });
}
