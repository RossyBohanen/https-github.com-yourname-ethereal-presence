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
 * Allowed formats: "5s", "30m", "2h", "1d", or empty/undefined.
 * @param delay The delay string to validate
 * @returns true if valid, false otherwise
 */
function isValidDelay(delay?: string): boolean {
  if (!delay) return true;
  return /^\d+[smhd]$/.test(delay);
}

/**
 * Safe wrapper for publishJSON that validates inputs and provides clear error messages.
 * @param opts Options for publishing a message
 * @returns The message ID if successful
 * @throws Error if client is not initialized or validation fails
 */
async function safePublishJSON(opts: {
  api: { name: string; baseUrl?: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    const error = new Error(
      "QStash client not initialized. QSTASH_TOKEN must be set in server-only environments."
    );
    // eslint-disable-next-line no-console
    console.error("QStash publish failed:", { error, opts });
    throw error;
  }

  if (!isValidDelay(opts.delay)) {
    const error = new Error(
      `Invalid delay format: "${opts.delay}". Expected format: <number><unit> where unit is s/m/h/d (e.g., "5s", "30m", "2h", "1d")`
    );
    // eslint-disable-next-line no-console
    console.error("QStash publish failed:", { error, opts });
    throw error;
  }

  try {
    const messageId = await client.publishJSON({
      api: {
        name: opts.api.name,
        baseUrl: opts.api.baseUrl || QSTASH_BASE_URL,
      },
      body: opts.body,
      delay: opts.delay,
    });
    return messageId;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("QStash publish failed:", { error: err, opts });
    throw err;
  }
}

export default client;

// Job operations
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
) {
  return safePublishJSON({
    api: { name: "email" },
    body: { email, subject },
    delay,
  });
}

export async function scheduleAnalyticsJob(userId: string) {
  return safePublishJSON({
    api: { name: "analytics" },
    body: { userId },
  });
}

export async function scheduleSubscriptionCheck(userId: string) {
  return safePublishJSON({
    api: { name: "subscription-check" },
    body: { userId },
    delay: "1d", // Check daily
  });
}
