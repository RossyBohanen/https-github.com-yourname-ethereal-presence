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

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
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

// Regex patterns compiled once to avoid repeated compilation
const DELAY_REGEX = /^\d+[smhd]$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a human-friendly delay string.
 * Allowed formats: 10s, 5m, 1h, 1d
 */
function validateDelay(delay: string): boolean {
  return DELAY_REGEX.test(delay);
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // Basic email validation
  return EMAIL_REGEX.test(email);
}

/**
 * Validate userId is non-empty string
 */
function validateUserId(userId: string): boolean {
  return typeof userId === "string" && userId.trim().length > 0;
}

/**
 * Validate subject is non-empty string
 */
function validateSubject(subject: string): boolean {
  return typeof subject === "string" && subject.trim().length > 0;
}

/**
 * Safe wrapper around client.publishJSON that ensures the client exists,
 * catches and logs errors with payload context, and rethrows for callers to handle.
 */
async function safePublishJSON(params: {
  apiName: string;
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client is not initialized. QSTASH_TOKEN must be set in server-only environments."
    );
  }

  // Validate delay format if provided
  if (params.delay && !validateDelay(params.delay)) {
    throw new Error(
      `Invalid delay format: "${params.delay}". Expected format: <number><unit> where unit is s, m, h, or d (e.g., 10s, 5m, 1h, 1d)`
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
    // Log error with sanitized context for diagnostics (exclude full payload to avoid logging PII)
    // eslint-disable-next-line no-console
    console.error("QStash publishJSON failed", {
      apiName: params.apiName,
      payloadKeys: Object.keys(params.body),
      delay: params.delay,
      error: err instanceof Error ? err.message : String(err),
    });
    // Rethrow for caller to handle
    throw err;
  }
}

/**
 * Schedule an email job with validation
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  // Input validation
  if (!validateEmail(email)) {
    throw new Error(`Invalid email address: "${email}"`);
  }
  if (!validateSubject(subject)) {
    throw new Error("Subject must be a non-empty string");
  }

  return safePublishJSON({
    apiName: "email",
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job with validation
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  // Input validation
  if (!validateUserId(userId)) {
    throw new Error("userId must be a non-empty string");
  }

  return safePublishJSON({
    apiName: "analytics",
    body: { userId },
  });
}

/**
 * Schedule a subscription check with validation
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  // Input validation
  if (!validateUserId(userId)) {
    throw new Error("userId must be a non-empty string");
  }

  return safePublishJSON({
    apiName: "subscription-check",
    body: { userId },
    delay: "1d", // Check daily
  });
}

// Export client (may be null) for advanced usage
export { client };
export default client;
