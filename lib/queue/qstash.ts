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
 */
function validateDelay(delay: string): void {
  const delayRegex = /^\d+[smhd]$/;
  if (!delayRegex.test(delay)) {
    throw new Error(
      `Invalid delay format: "${delay}". Expected format: number followed by s/m/h/d (e.g., 10s, 5m, 1h, 1d)`
    );
  }
}

/**
 * Validate email address format
 */
function validateEmail(email: string): void {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a non-empty string");
  }
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email format: "${email}"`);
  }
}

/**
 * Validate userId format
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string") {
    throw new Error("UserId is required and must be a non-empty string");
  }
}

/**
 * Validate subject format
 */
function validateSubject(subject: string): void {
  if (!subject || typeof subject !== "string") {
    throw new Error("Subject is required and must be a non-empty string");
  }
}

/**
 * Safe wrapper around client.publishJSON that validates client exists,
 * catches errors, logs them with context, and rethrows for caller handling.
 */
async function safePublishJSON(params: {
  api: { name: string; baseUrl: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QSTASH_TOKEN is not configured. QStash client is unavailable. " +
      "Ensure QSTASH_TOKEN is set in server-only environments (not edge/browser)."
    );
  }

  try {
    const messageId = await client.publishJSON(params);
    return messageId;
  } catch (err) {
    // Log error with payload context for diagnostics
    // eslint-disable-next-line no-console
    console.error("QStash publish failed", {
      api: params.api.name,
      body: params.body,
      delay: params.delay,
      error: err instanceof Error ? err.message : String(err),
    });
    // Rethrow for caller to handle
    throw err;
  }
}

/**
 * Schedule an email job
 * @throws Error if email/subject are invalid, delay format is wrong, or QSTASH_TOKEN is missing
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
 * Schedule an analytics job
 * @throws Error if userId is invalid or QSTASH_TOKEN is missing
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
 * Schedule a subscription check (daily)
 * @throws Error if userId is invalid or QSTASH_TOKEN is missing
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

/**
 * Export the client for advanced usage (may be null if QSTASH_TOKEN is not set)
 */
export { client };
export default client;
