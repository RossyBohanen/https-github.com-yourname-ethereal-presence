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
 * Allowed formats: 10s, 5m, 1h, 1d
 * Returns the normalized delay string or throws an error.
 */
function validateDelay(delay: string): string {
  const delayPattern = /^(\d+)(s|m|h|d)$/;
  const match = delay.match(delayPattern);
  
  if (!match) {
    throw new Error(
      `Invalid delay format: "${delay}". Expected format: <number><unit> where unit is s (seconds), m (minutes), h (hours), or d (days). Examples: 10s, 5m, 1h, 1d`
    );
  }
  
  return delay; // Already in correct format
}

/**
 * Validate email format
 */
function validateEmail(email: string): void {
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    throw new Error("Email is required and must be a non-empty string");
  }
  
  // Basic email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error(`Invalid email format: "${email}"`);
  }
}

/**
 * Validate userId format
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    throw new Error("userId is required and must be a non-empty string");
  }
}

/**
 * Validate subject format
 */
function validateSubject(subject: string): void {
  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    throw new Error("subject is required and must be a non-empty string");
  }
}

/**
 * Safe wrapper around client.publishJSON that:
 * - Ensures client exists
 * - Validates inputs
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
      "QStash client is not initialized. QSTASH_TOKEN environment variable must be set in server-only environments."
    );
  }

  try {
    const messageId = await client.publishJSON(params);
    return messageId;
  } catch (err) {
    // Log error with payload context for diagnostics
    // eslint-disable-next-line no-console
    console.error("QStash publishJSON failed", {
      api: params.api,
      body: params.body,
      delay: params.delay,
      error: err instanceof Error ? err.message : String(err),
    });
    
    // Rethrow for callers to handle
    throw err;
  }
}

/**
 * Schedule an email job via QStash
 * 
 * @param email - Recipient email address
 * @param subject - Email subject line
 * @param delay - Optional delay in format: 10s, 5m, 1h, 1d
 * @throws Error if QSTASH_TOKEN is not set or inputs are invalid
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  validateEmail(email);
  validateSubject(subject);
  
  if (delay) {
    delay = validateDelay(delay);
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
 * 
 * @param userId - User identifier
 * @throws Error if QSTASH_TOKEN is not set or userId is invalid
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    api: {
      name: "analytics",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { userId },
  });
}

/**
 * Schedule a daily subscription check via QStash
 * 
 * @param userId - User identifier
 * @throws Error if QSTASH_TOKEN is not set or userId is invalid
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  validateUserId(userId);

  return safePublishJSON({
    api: {
      name: "subscription-check",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { userId },
    delay: "1d", // Check daily
  });
}

// Export client for advanced usage (may be null if QSTASH_TOKEN is not set)
export { client };
export default client;
