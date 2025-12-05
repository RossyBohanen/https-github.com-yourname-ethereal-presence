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
 * Allowed formats: 10s, 5m, 1h, 1d (seconds, minutes, hours, days)
 */
function validateDelay(delay: string): boolean {
  const pattern = /^\d+[smhd]$/;
  return pattern.test(delay);
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Safe wrapper for publishJSON that ensures client exists and provides structured error logging
 */
async function safePublishJSON(
  apiName: string,
  body: Record<string, unknown>,
  delay?: string
): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client not initialized. QSTASH_TOKEN must be set in server-only environment."
    );
  }

  try {
    const messageId = await client.publishJSON({
      api: {
        name: apiName,
        baseUrl: QSTASH_BASE_URL,
      },
      body,
      delay,
    });
    return messageId;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("QStash publish failed", {
      apiName,
      payload: body,
      delay,
      error: err,
    });
    throw err;
  }
}

/**
 * Schedule an email job
 * @throws Error if email or subject is invalid, or if QSTASH_TOKEN is not set
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  if (!email || typeof email !== "string") {
    throw new Error("email is required and must be a non-empty string");
  }
  if (!validateEmail(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }
  if (!subject || typeof subject !== "string") {
    throw new Error("subject is required and must be a non-empty string");
  }
  if (delay && !validateDelay(delay)) {
    throw new Error(
      `Invalid delay format: ${delay}. Must match pattern: \\d+[smhd] (e.g., 10s, 5m, 1h, 1d)`
    );
  }

  return safePublishJSON("email", { email, subject }, delay);
}

/**
 * Schedule an analytics job
 * @throws Error if userId is invalid, or if QSTASH_TOKEN is not set
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  if (!userId || typeof userId !== "string") {
    throw new Error("userId is required and must be a non-empty string");
  }

  return safePublishJSON("analytics", { userId });
}

/**
 * Schedule a subscription check job (runs daily)
 * @throws Error if userId is invalid, or if QSTASH_TOKEN is not set
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  if (!userId || typeof userId !== "string") {
    throw new Error("userId is required and must be a non-empty string");
  }

  return safePublishJSON("subscription-check", { userId }, "1d");
}

// Export client for advanced usage (may be null)
export { client };
