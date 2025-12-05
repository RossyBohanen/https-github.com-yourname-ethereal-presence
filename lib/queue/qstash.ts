/**
 * QStash Queue Client - Server-Only Module
 * 
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * This module MUST ONLY be imported in server-side code (Netlify Functions, API routes).
 * NEVER import this module in edge functions, browser code, or client-side components.
 * The QSTASH_TOKEN must remain server-side only to prevent exposure in edge/browser runtimes.
 * 
 * This module provides a hardened wrapper around the Upstash QStash client with:
 * - Safe initialization (client is null when QSTASH_TOKEN is missing)
 * - Input validation for all parameters
 * - Delay format validation and normalization
 * - Error handling with contextual logging
 * - Clear error messages for missing configuration
 */

import { Client } from "@upstash/qstash";
import { instrumentUpstash } from "@kubiks/otel-upstash-queues";

/**
 * Email address validation regex
 * Basic validation - accepts most valid email formats
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Delay format validation regex
 * Accepts formats like: 10s, 5m, 1h, 2d
 * s = seconds, m = minutes, h = hours, d = days
 */
const DELAY_FORMAT_REGEX = /^(\d+)(s|m|h|d)$/;

/**
 * QStash client instance - may be null if QSTASH_TOKEN is not configured
 * This prevents runtime errors when the token is missing during development or testing
 */
const client: Client | null = process.env.QSTASH_TOKEN
  ? new Client({
      token: process.env.QSTASH_TOKEN,
    })
  : null;

// Add OpenTelemetry instrumentation only if client exists
if (client) {
  instrumentUpstash(client);
}

/**
 * Export the client for advanced usage
 * Consumers should check if client is not null before using
 */
export default client;

/**
 * Validates an email address format
 * @param email - The email address to validate
 * @throws Error if email is invalid
 */
function validateEmail(email: string): void {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a string");
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }
}

/**
 * Validates a user ID
 * @param userId - The user ID to validate
 * @throws Error if userId is invalid
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string") {
    throw new Error("userId is required and must be a non-empty string");
  }
  if (userId.trim().length === 0) {
    throw new Error("userId cannot be empty or whitespace");
  }
}

/**
 * Validates a subject string
 * @param subject - The subject to validate
 * @throws Error if subject is invalid
 */
function validateSubject(subject: string): void {
  if (!subject || typeof subject !== "string") {
    throw new Error("subject is required and must be a non-empty string");
  }
  if (subject.trim().length === 0) {
    throw new Error("subject cannot be empty or whitespace");
  }
}

/**
 * Validates and normalizes delay format
 * Accepts: 10s, 5m, 1h, 2d
 * @param delay - The delay string to validate
 * @returns The normalized delay string
 * @throws Error if delay format is invalid
 */
function validateDelay(delay: string): string {
  if (!delay || typeof delay !== "string") {
    throw new Error("delay must be a non-empty string");
  }
  
  const match = delay.trim().match(DELAY_FORMAT_REGEX);
  if (!match) {
    throw new Error(
      `Invalid delay format: ${delay}. Expected format: number followed by s/m/h/d (e.g., 10s, 5m, 1h, 2d)`
    );
  }
  
  const [, value, unit] = match;
  const numValue = parseInt(value, 10);
  
  if (numValue <= 0) {
    throw new Error(`Delay value must be positive: ${delay}`);
  }
  
  // Return normalized format (trim whitespace)
  return `${numValue}${unit}`;
}

/**
 * Safe wrapper around client.publishJSON with error handling and validation
 * @param payload - The payload to publish
 * @returns The message ID from QStash
 * @throws Error if client is not initialized or if publishing fails
 */
async function safePublishJSON(payload: {
  api: { name: string; baseUrl: string };
  body: Record<string, unknown>;
  delay?: string;
}): Promise<string> {
  if (!client) {
    throw new Error(
      "QStash client is not initialized. QSTASH_TOKEN environment variable must be set."
    );
  }

  try {
    const messageId = await client.publishJSON(payload);
    return messageId;
  } catch (error) {
    // Log the error with context for debugging
    console.error("QStash publishJSON failed:", {
      error: error instanceof Error ? error.message : String(error),
      payload: {
        api: payload.api,
        bodyKeys: Object.keys(payload.body),
        delay: payload.delay,
      },
    });
    
    // Re-throw for caller to handle
    throw error;
  }
}

/**
 * Schedule an email job in QStash
 * @param email - Recipient email address (validated)
 * @param subject - Email subject (validated)
 * @param delay - Optional delay in format: 10s, 5m, 1h, 2d (validated if provided)
 * @returns The message ID from QStash
 * @throws Error if validation fails, QSTASH_TOKEN is not set, or publishing fails
 * 
 * @example
 * ```typescript
 * // Schedule immediate email
 * await scheduleEmailJob("user@example.com", "Welcome!");
 * 
 * // Schedule delayed email
 * await scheduleEmailJob("user@example.com", "Reminder", "1h");
 * ```
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<string> {
  // Validate inputs
  validateEmail(email);
  validateSubject(subject);
  
  if (delay !== undefined && delay !== null) {
    delay = validateDelay(delay);
  }

  // Publish to QStash
  return safePublishJSON({
    api: {
      name: "email",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job in QStash
 * @param userId - User ID to process analytics for (validated)
 * @returns The message ID from QStash
 * @throws Error if validation fails, QSTASH_TOKEN is not set, or publishing fails
 * 
 * @example
 * ```typescript
 * await scheduleAnalyticsJob("user-123");
 * ```
 */
export async function scheduleAnalyticsJob(userId: string): Promise<string> {
  // Validate input
  validateUserId(userId);

  // Publish to QStash
  return safePublishJSON({
    api: {
      name: "analytics",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { userId },
  });
}

/**
 * Schedule a daily subscription check job in QStash
 * @param userId - User ID to check subscription for (validated)
 * @returns The message ID from QStash
 * @throws Error if validation fails, QSTASH_TOKEN is not set, or publishing fails
 * 
 * @example
 * ```typescript
 * await scheduleSubscriptionCheck("user-123");
 * ```
 */
export async function scheduleSubscriptionCheck(userId: string): Promise<string> {
  // Validate input
  validateUserId(userId);

  // Publish to QStash with 1 day delay
  return safePublishJSON({
    api: {
      name: "subscription-check",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { userId },
    delay: "1d", // Check daily
  });
}
