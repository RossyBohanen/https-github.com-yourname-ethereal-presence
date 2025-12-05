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
 * Allowed formats: 10s, 5m, 1h, 1d (single unit only, compound delays like "1h30m" are not supported)
 * @param delay - The delay string to validate
 * @returns true if valid, false otherwise
 */
function isValidDelay(delay: string): boolean {
  return /^\d+[smhd]$/.test(delay);
}

/**
 * Validate email format (basic validation)
 * Note: This is a simple validation to catch obvious typos. For production use,
 * consider using a more robust validation library or RFC 5322 compliant regex.
 * @param email - The email to validate
 * @returns true if valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Safe wrapper around client.publishJSON that validates inputs and handles errors
 * @param apiName - The API endpoint name
 * @param body - The payload to publish
 * @param delay - Optional delay string (e.g., "10s", "5m", "1h", "1d")
 * @returns The message ID from QStash
 * @throws Error if client is null, validation fails, or publish fails
 */
async function safePublishJSON(
  apiName: string,
  body: Record<string, unknown>,
  delay?: string
): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client not initialized - QSTASH_TOKEN must be set in server environment"
    );
  }

  // Validate delay format if provided
  if (delay && !isValidDelay(delay)) {
    throw new Error(
      `Invalid delay format: "${delay}". Must match pattern: <number><unit> where unit is s, m, h, or d (e.g., "10s", "5m", "1h", "1d")`
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
    // Log with payload context for debugging
    // WARNING: body may contain sensitive data (emails, user IDs, etc.)
    // In production, consider sanitizing or limiting what gets logged
    // eslint-disable-next-line no-console
    console.error("QStash publish failed", {
      apiName,
      body,
      delay,
      error: err,
    });
    throw err;
  }
}

/**
 * Schedule an email job
 * @param email - The recipient email address
 * @param subject - The email subject
 * @param delay - Optional delay (e.g., "10s", "5m", "1h", "1d")
 * @returns The message ID from QStash
 * @throws Error if QSTASH_TOKEN is not set, inputs are invalid, or publish fails
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  if (!email || !email.trim()) {
    throw new Error("email is required and cannot be empty");
  }
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email format: "${email}"`);
  }
  if (!subject || !subject.trim()) {
    throw new Error("subject is required and cannot be empty");
  }

  return safePublishJSON("email", { email, subject }, delay);
}

/**
 * Schedule an analytics job
 * @param userId - The user ID to process analytics for
 * @returns The message ID from QStash
 * @throws Error if QSTASH_TOKEN is not set, userId is invalid, or publish fails
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error("userId is required and cannot be empty");
  }

  return safePublishJSON("analytics", { userId });
}

/**
 * Schedule a subscription check job (runs daily by default)
 * @param userId - The user ID to check subscription for
 * @returns The message ID from QStash
 * @throws Error if QSTASH_TOKEN is not set, userId is invalid, or publish fails
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error("userId is required and cannot be empty");
  }

  return safePublishJSON("subscription-check", { userId }, "1d");
}

/**
 * Export the client for advanced usage.
 * Note: May be null if QSTASH_TOKEN is not set.
 * Always check for null before using.
 */
export { client };
