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
 * Allowed formats: 10s, 5m, 1h, 1d (number followed by s/m/h/d)
 */
function validateDelay(delay: string | undefined): void {
  if (!delay) return;
  const delayPattern = /^\d+[smhd]$/;
  if (!delayPattern.test(delay)) {
    throw new Error(
      `Invalid delay format: "${delay}". Expected format: number + unit (s/m/h/d), e.g., "10s", "5m", "1h", "1d"`
    );
  }
}

/**
 * Validate email format (basic check)
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
 * Validate userId (must be non-empty string)
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string") {
    throw new Error("userId is required and must be a non-empty string");
  }
}

/**
 * Validate subject (must be non-empty string)
 */
function validateSubject(subject: string): void {
  if (!subject || typeof subject !== "string") {
    throw new Error("subject is required and must be a non-empty string");
  }
}

/**
 * Safe wrapper for QStash publishJSON that ensures client exists,
 * performs validation, and provides structured error logging.
 *
 * @throws Error if client is not initialized or publish fails
 */
async function safePublishJSON(params: {
  apiName: string;
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client not initialized. QSTASH_TOKEN must be set in server-only environment."
    );
  }

  // Validate delay if provided
  validateDelay(params.delay);

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
  } catch (error) {
    // Log error with payload context for debugging
    // eslint-disable-next-line no-console
    console.error("QStash publish failed", {
      apiName: params.apiName,
      body: params.body,
      delay: params.delay,
      error: error instanceof Error ? error.message : String(error),
    });
    // Rethrow for caller to handle
    throw error;
  }
}

/**
 * Schedule an email job via QStash
 *
 * @param email - Recipient email address (validated)
 * @param subject - Email subject (validated)
 * @param delay - Optional delay (e.g., "10s", "5m", "1h", "1d")
 * @throws Error if validation fails or QSTASH_TOKEN not set
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
 * Schedule an analytics job via QStash
 *
 * @param userId - User identifier (validated)
 * @throws Error if validation fails or QSTASH_TOKEN not set
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    apiName: "analytics",
    body: { userId },
  });
}

/**
 * Schedule a daily subscription check via QStash
 *
 * @param userId - User identifier (validated)
 * @throws Error if validation fails or QSTASH_TOKEN not set
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
 * Export client for advanced usage (may be null if QSTASH_TOKEN not set)
 * Use with caution - prefer using the safe helper functions above.
 */
export { client };
