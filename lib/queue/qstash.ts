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
 * Allowed formats: Ns, Nm, Nh, Nd where N is a positive integer.
 * Examples: 10s, 5m, 1h, 1d
 */
function validateDelayFormat(delay: string): boolean {
  const delayPattern = /^[1-9]\d*[smhd]$/;
  return delayPattern.test(delay);
}

/**
 * Validate email format (basic check).
 */
function validateEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailPattern.test(email);
}

/**
 * Safe wrapper around client.publishJSON.
 * - Ensures client exists
 * - Catches and logs errors with payload context
 * - Rethrows for caller to handle
 */
async function safePublishJSON(params: {
  api: { name: string; baseUrl: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error("QStash client is not initialized. QSTASH_TOKEN is not set.");
  }

  try {
    const messageId = await client.publishJSON(params);
    return messageId;
  } catch (err) {
    // Log error with payload context for debugging (sanitized to avoid exposing sensitive data)
    // eslint-disable-next-line no-console
    console.error("QStash publishJSON failed", {
      api: params.api.name,
      bodyKeys: Object.keys(params.body),
      delay: params.delay,
      error: err,
    });
    throw err;
  }
}

/**
 * Schedule an email job.
 * @throws Error if email or subject is invalid, or if QSTASH_TOKEN is not set
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  if (!email || !email.trim()) {
    throw new Error("scheduleEmailJob: email is required");
  }
  if (!validateEmail(email)) {
    throw new Error(`scheduleEmailJob: invalid email format: ${email}`);
  }
  if (!subject || !subject.trim()) {
    throw new Error("scheduleEmailJob: subject is required");
  }
  if (delay && !validateDelayFormat(delay)) {
    throw new Error(
      `scheduleEmailJob: invalid delay format: ${delay}. Expected format: Ns, Nm, Nh, or Nd (e.g., 10s, 5m, 1h, 1d)`
    );
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
 * @throws Error if userId is invalid, or if QSTASH_TOKEN is not set
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error("scheduleAnalyticsJob: userId is required");
  }

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
 * @throws Error if userId is invalid, or if QSTASH_TOKEN is not set
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error("scheduleSubscriptionCheck: userId is required");
  }

  return safePublishJSON({
    api: {
      name: "subscription-check",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { userId },
    delay: "1d", // Check daily
  });
}

// Export client (may be null) for advanced usage
export { client };
export default client;
