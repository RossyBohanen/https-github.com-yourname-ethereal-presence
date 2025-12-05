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
 * Allowed formats: "10s", "5m", "1h", "2d"
 * Returns true if valid, false otherwise.
 */
function isValidDelay(delay: string): boolean {
  if (!delay || typeof delay !== "string") return false;
  // Match: one or more digits followed by s, m, h, or d
  return /^\d+[smhd]$/.test(delay);
}

/**
 * Safe wrapper around client.publishJSON with validation and error handling.
 * Throws clear errors when client is not available or validation fails.
 */
async function safePublishJSON(params: {
  api: { name: string; baseUrl: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error("QStash client not initialized. QSTASH_TOKEN must be set in server environment.");
  }

  // Validate delay if provided
  if (params.delay && !isValidDelay(params.delay)) {
    const error = new Error(`Invalid delay format: "${params.delay}". Expected format: digits followed by s/m/h/d (e.g., "30s", "5m", "1h", "2d")`);
    // eslint-disable-next-line no-console
    console.error("safePublishJSON validation failed", { delay: params.delay, api: params.api.name });
    throw error;
  }

  try {
    const messageId = await client.publishJSON(params);
    return messageId;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("safePublishJSON failed", { api: params.api.name, error: err });
    throw err;
  }
}

/**
 * Get the QStash client instance.
 * Throws an error if QSTASH_TOKEN is not configured.
 * Use the safe wrapper functions (scheduleEmailJob, etc.) instead when possible.
 */
function getClient(): Client {
  if (!client) {
    throw new Error("QStash client not initialized. QSTASH_TOKEN must be set in server environment.");
  }
  return client;
}

export default getClient;

// Job operations
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
) {
  const messageId = await safePublishJSON({
    api: {
      name: "email",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { email, subject },
    delay,
  });
  return messageId;
}

export async function scheduleAnalyticsJob(userId: string) {
  const messageId = await safePublishJSON({
    api: {
      name: "analytics",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { userId },
  });
  return messageId;
}

export async function scheduleSubscriptionCheck(userId: string) {
  const messageId = await safePublishJSON({
    api: {
      name: "subscription-check",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { userId },
    delay: "1d", // Check daily
  });
  return messageId;
}
