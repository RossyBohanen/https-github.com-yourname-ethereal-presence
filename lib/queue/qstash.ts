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
 * @param delay - The delay string to validate
 * @returns true if valid, false otherwise
 */
function isValidDelay(delay: string): boolean {
  const delayPattern = /^\d+[smhd]$/;
  return delayPattern.test(delay);
}

/**
 * Validate email format.
 * @param email - The email address to validate
 * @returns true if valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Safe wrapper for publishJSON that ensures client exists and handles errors.
 * @param apiName - The API name for routing
 * @param body - The payload to publish
 * @param delay - Optional delay string (e.g., "10s", "5m", "1h", "1d")
 * @throws Error if client is null or publish fails
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

  if (delay && !isValidDelay(delay)) {
    throw new Error(
      `Invalid delay format: "${delay}". Expected format: number followed by s/m/h/d (e.g., "10s", "5m", "1h", "1d")`
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
  } catch (error) {
    // Log error with context for debugging
    // eslint-disable-next-line no-console
    console.error("QStash publish failed", {
      apiName,
      payload: body,
      delay,
      error: error instanceof Error ? error.message : String(error),
    });
    // Rethrow for caller to handle
    throw error;
  }
}

/**
 * Schedule an email job via QStash.
 * @param email - Recipient email address (must be valid)
 * @param subject - Email subject (must be non-empty)
 * @param delay - Optional delay string (e.g., "10s", "5m", "1h", "1d")
 * @throws Error if inputs are invalid or QSTASH_TOKEN is not set
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  if (!email || !email.trim()) {
    throw new Error("Email is required");
  }
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email format: "${email}"`);
  }
  if (!subject || !subject.trim()) {
    throw new Error("Subject is required");
  }

  return safePublishJSON("email", { email, subject }, delay);
}

/**
 * Schedule an analytics job via QStash.
 * @param userId - User ID (must be non-empty)
 * @throws Error if userId is invalid or QSTASH_TOKEN is not set
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error("userId is required");
  }

  return safePublishJSON("analytics", { userId });
}

/**
 * Schedule a subscription check job via QStash.
 * @param userId - User ID (must be non-empty)
 * @throws Error if userId is invalid or QSTASH_TOKEN is not set
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error("userId is required");
  }

  return safePublishJSON("subscription-check", { userId }, "1d");
}

/**
 * Export client for advanced usage.
 * May be null if QSTASH_TOKEN is not set.
 */
export { client };
export default client;
