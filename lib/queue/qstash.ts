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
 * Allowed formats: Ns (seconds), Nm (minutes), Nh (hours), Nd (days)
 * Examples: "10s", "5m", "1h", "1d"
 */
function isValidDelay(delay: string): boolean {
  return /^\d+[smhd]$/.test(delay);
}

/**
 * Validate email format (basic check)
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Safe wrapper around client.publishJSON that:
 * - Ensures client exists
 * - Catches and logs errors with payload context
 * - Rethrows for callers to handle
 */
async function safePublishJSON(params: {
  api: { name: string; baseUrl: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client is not initialized. QSTASH_TOKEN must be set in server-only environment."
    );
  }

  try {
    const messageId = await client.publishJSON(params);
    return messageId;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("QStash publish failed", {
      api: params.api.name,
      body: params.body,
      delay: params.delay,
      error: err,
    });
    throw err;
  }
}

/**
 * Schedule an email job via QStash
 * @throws Error if QSTASH_TOKEN is not set, email is invalid, subject is empty, or delay format is invalid
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  if (!email || !isValidEmail(email)) {
    throw new Error(`Invalid email address: ${email}`);
  }
  if (!subject || subject.trim() === "") {
    throw new Error("Subject cannot be empty");
  }
  if (delay && !isValidDelay(delay)) {
    throw new Error(
      `Invalid delay format: ${delay}. Expected format: Ns, Nm, Nh, or Nd (e.g., "10s", "5m", "1h", "1d")`
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
 * Schedule an analytics job via QStash
 * @throws Error if QSTASH_TOKEN is not set or userId is empty
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  if (!userId || userId.trim() === "") {
    throw new Error("userId cannot be empty");
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
 * Schedule a subscription check via QStash (daily check)
 * @throws Error if QSTASH_TOKEN is not set or userId is empty
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  if (!userId || userId.trim() === "") {
    throw new Error("userId cannot be empty");
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

/**
 * Export client for advanced usage
 * WARNING: May be null if QSTASH_TOKEN is not set
 */
export { client };
