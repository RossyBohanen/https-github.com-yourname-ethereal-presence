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

/**
 * Validate a human-friendly delay string.
 * Allowed formats: "10s", "5m", "2h", "1d"
 */
function isValidDelay(delay: string | undefined): boolean {
  if (!delay) return true;
  return /^\d+[smhd]$/.test(delay);
}

/**
 * Safe wrapper for publishJSON that validates inputs and logs failures
 */
async function safePublishJSON(params: {
  api: { name: string; baseUrl?: string };
  body: unknown;
  delay?: string;
}): Promise<string> {
  // Validate client is initialized
  if (!client) {
    const error = "QStash client not initialized - QSTASH_TOKEN is missing";
    // eslint-disable-next-line no-console
    console.error(error, { api: params.api.name });
    throw new Error(error);
  }

  // Validate delay format
  if (params.delay && !isValidDelay(params.delay)) {
    const error = `Invalid delay format: ${params.delay}. Use format like "10s", "5m", "2h", "1d"`;
    // eslint-disable-next-line no-console
    console.error(error, { api: params.api.name, delay: params.delay });
    throw new Error(error);
  }

  // Validate body is not null/undefined
  if (params.body === null || params.body === undefined) {
    const error = "Message body cannot be null or undefined";
    // eslint-disable-next-line no-console
    console.error(error, { api: params.api.name });
    throw new Error(error);
  }

  try {
    const messageId = await client.publishJSON({
      api: {
        name: params.api.name,
        baseUrl: params.api.baseUrl || QSTASH_BASE_URL,
      },
      body: params.body,
      delay: params.delay,
    });
    return messageId;
  } catch (err) {
    // Structured logging on failure
    // eslint-disable-next-line no-console
    console.error("QStash publishJSON failed", {
      api: params.api.name,
      error: err instanceof Error ? err.message : String(err),
      delay: params.delay,
    });
    throw err;
  }
}

/**
 * Get the QStash client, throwing an error if not initialized.
 * Prefer using the safe wrapper functions (scheduleEmailJob, etc.) instead.
 */
export function getClient(): Client {
  if (!client) {
    throw new Error("QStash client not initialized - QSTASH_TOKEN is missing");
  }
  return client;
}

export default getClient;

// Job operations using safe wrapper
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
) {
  if (!email || !subject) {
    throw new Error("Email and subject must be non-empty strings");
  }
  
  return safePublishJSON({
    api: { name: "email" },
    body: { email, subject },
    delay,
  });
}

export async function scheduleAnalyticsJob(userId: string) {
  if (!userId) {
    throw new Error("UserId must be a non-empty string");
  }
  
  return safePublishJSON({
    api: { name: "analytics" },
    body: { userId },
  });
}

export async function scheduleSubscriptionCheck(userId: string) {
  if (!userId) {
    throw new Error("UserId must be a non-empty string");
  }
  
  return safePublishJSON({
    api: { name: "subscription-check" },
    body: { userId },
    delay: "1d", // Check daily
  });
}
