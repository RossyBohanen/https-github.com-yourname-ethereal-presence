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
 * Allowed formats: "10s", "5m", "1h", "1d"
 */
function validateDelay(delay: string): void {
  const delayPattern = /^\d+[smhd]$/;
  if (!delayPattern.test(delay)) {
    throw new Error(
      `Invalid delay format: "${delay}". Expected format: <number><unit> where unit is s (seconds), m (minutes), h (hours), or d (days).`
    );
  }
}

/**
 * Validate email format.
 */
function validateEmail(email: string): void {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error(`Invalid email: "${email}"`);
  }
}

/**
 * Validate userId.
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error(`Invalid userId: "${userId}"`);
  }
}

/**
 * Validate subject.
 */
function validateSubject(subject: string): void {
  if (!subject || typeof subject !== "string" || subject.trim() === "") {
    throw new Error(`Invalid subject: "${subject}"`);
  }
}

/**
 * Safe wrapper around client.publishJSON that:
 * 1. Ensures client exists (throws if token not set)
 * 2. Catches and logs errors with payload context
 * 3. Rethrows for callers to handle
 */
async function safePublishJSON(params: {
  api: { name: string; baseUrl: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client is not initialized. Ensure QSTASH_TOKEN is set in a server-only environment (not edge or browser)."
    );
  }

  try {
    const messageId = await client.publishJSON(params);
    return messageId;
  } catch (err) {
    // Log error with payload context for diagnostics
    // eslint-disable-next-line no-console
    console.error("QStash publishJSON failed", {
      api: params.api.name,
      body: params.body,
      delay: params.delay,
      error: err,
    });
    // Rethrow for caller to handle
    throw err;
  }
}

/**
 * Schedule an email job.
 * @throws Error if email, subject are invalid, or delay format is incorrect, or QSTASH_TOKEN is not set.
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
    api: {
      name: "email",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job.
 * @throws Error if userId is invalid or QSTASH_TOKEN is not set.
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    api: {
      name: "analytics",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { userId },
  });
}

/**
 * Schedule a subscription check.
 * @throws Error if userId is invalid or QSTASH_TOKEN is not set.
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    api: {
      name: "subscription-check",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { userId },
    delay: "1d", // Check daily
  });
}

// Export client for advanced usage (may be null if token not set)
export { client };
