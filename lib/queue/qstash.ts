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
 * Allowed formats: "10s", "5m", "1h", "7d" etc.
 */
function validateDelay(delay?: string): void {
  if (!delay) return;
  const pattern = /^\d+[smhd]$/;
  if (!pattern.test(delay)) {
    throw new Error(`Invalid delay format: ${delay}. Expected format: <number><unit> where unit is s/m/h/d`);
  }
}

/**
 * Safely publish JSON payload to QStash with validation and error handling
 */
async function safePublishJSON(params: {
  apiName: string;
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    const error = new Error("QStash client not initialized. Ensure QSTASH_TOKEN is set in server environment.");
    console.error("QStash publish failed:", { error: error.message, apiName: params.apiName });
    throw error;
  }

  // Validate delay format
  validateDelay(params.delay);

  // Validate body is not empty
  if (!params.body || Object.keys(params.body).length === 0) {
    const error = new Error("Cannot publish empty body");
    console.error("QStash publish failed:", { error: error.message, apiName: params.apiName });
    throw error;
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
    // Structured logging on failure
    console.error("QStash publish failed:", {
      error: err instanceof Error ? err.message : String(err),
      apiName: params.apiName,
      delay: params.delay,
    });
    throw err;
  }
}

// Job operations using the safe wrapper
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
) {
  return safePublishJSON({
    apiName: "email",
    body: { email, subject },
    delay,
  });
}

export async function scheduleAnalyticsJob(userId: string) {
  return safePublishJSON({
    apiName: "analytics",
    body: { userId },
  });
}

export async function scheduleSubscriptionCheck(userId: string) {
  return safePublishJSON({
    apiName: "subscription-check",
    body: { userId },
    delay: "1d",
  });
}

/**
 * Get the QStash client instance
 * 
 * WARNING: Direct client usage bypasses the safety features of this wrapper.
 * Only use this if you need advanced QStash features not exposed by the wrapper functions.
 * Prefer using scheduleEmailJob, scheduleAnalyticsJob, or scheduleSubscriptionCheck instead.
 */
export function getQStashClient(): Client | null {
  if (!client) {
    console.warn("QStash client not initialized. Ensure QSTASH_TOKEN is set in server environment.");
  }
  return client;
}
