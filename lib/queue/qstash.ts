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
 * Allowed formats: "10s", "5m", "2h", "1d" (seconds, minutes, hours, days)
 * @param delay - The delay string to validate
 * @returns true if valid, false otherwise
 */
function isValidDelay(delay: string | undefined): boolean {
  if (!delay) return true; // undefined/empty is valid (no delay)
  return /^\d+[smhd]$/.test(delay);
}

/**
 * Safe wrapper around client.publishJSON with validation and error handling.
 * @param params - The publish parameters
 * @returns The message ID from QStash
 * @throws Error if client is not initialized or validation fails
 */
async function safePublishJSON(params: {
  api: { name: string; baseUrl?: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    const error = new Error(
      "QStash client not initialized. Ensure QSTASH_TOKEN is set in server-only environments."
    );
    // eslint-disable-next-line no-console
    console.error("safePublishJSON failed", { error: error.message, params });
    throw error;
  }

  if (params.delay && !isValidDelay(params.delay)) {
    const error = new Error(
      `Invalid delay format: "${params.delay}". Expected format: number + unit (s/m/h/d), e.g., "10s", "5m", "2h", "1d".`
    );
    // eslint-disable-next-line no-console
    console.error("safePublishJSON failed", { error: error.message, params });
    throw error;
  }

  try {
    // Client is guaranteed to be non-null at this point due to check above
    const messageId = await client!.publishJSON({
      api: {
        name: params.api.name,
        baseUrl: params.api.baseUrl || QSTASH_BASE_URL,
      },
      body: params.body,
      delay: params.delay,
    });
    return messageId;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("safePublishJSON failed", { error: err, params });
    throw err;
  }
}

/**
 * Schedule an email job to be processed by QStash
 * @param email - The recipient email address
 * @param subject - The email subject
 * @param delay - Optional delay before processing (e.g., "10s", "5m", "2h", "1d")
 * @returns The message ID from QStash
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  return safePublishJSON({
    api: { name: "email" },
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job to be processed by QStash
 * @param userId - The user ID for analytics processing
 * @returns The message ID from QStash
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  return safePublishJSON({
    api: { name: "analytics" },
    body: { userId },
  });
}

/**
 * Schedule a subscription check job to be processed by QStash
 * @param userId - The user ID to check subscription for
 * @returns The message ID from QStash
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  return safePublishJSON({
    api: { name: "subscription-check" },
    body: { userId },
    delay: "1d", // Check daily
  });
}

export default client;
