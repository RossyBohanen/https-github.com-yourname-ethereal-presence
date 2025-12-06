import { Client } from "@upstash/qstash";
import { instrumentUpstash } from "@kubiks/otel-upstash-queues";

/**
 * Result type for QStash publish operations
 */
export interface PublishResult {
  ok: boolean;
  id?: string;
  error?: string;
}

type DelayString = `${number}s` | `${number}m` | `${number}h` | `${number}d` | string;

/**
 * QStash client interface with safe publish method
 */
export interface QStashClient {
  publishJSON: (params: {
    api: { name: string; baseUrl: string };
    body: Record<string, unknown>;
    delay?: DelayString;
  }) => Promise<unknown>;
  safePublishJSON: (params: {
    api: { name: string; baseUrl: string };
    body: Record<string, unknown>;
    delay?: DelayString;
  }) => Promise<PublishResult>;
}

// Check if QSTASH_TOKEN is configured
const token = process.env.QSTASH_TOKEN;
const hasToken = token && token.trim().length > 0;

/**
 * Create a stub client that throws errors for missing token
 */
function createStubClient(): QStashClient {
  const throwError = () => {
    throw new Error(
      "QStash is not configured. Please set QSTASH_TOKEN environment variable. This is a server-only operation."
    );
  };

  return {
    publishJSON: throwError,
    safePublishJSON: async () => ({
      ok: false,
      error: "QStash is not configured. Please set QSTASH_TOKEN environment variable.",
    }),
  };
}

/**
 * Create a real QStash client with instrumentation
 */
function createRealClient(): QStashClient {
  const client = new Client({
    token: token!,
  });

  // Add OpenTelemetry instrumentation when token exists
  try {
    instrumentUpstash(client);
  } catch (err) {
    // Instrumentation is optional - continue without it
    console.warn("Failed to instrument QStash client:", err);
  }

  return {
    publishJSON: (params: { api: { name: string; baseUrl: string }; body: Record<string, unknown>; delay?: DelayString }) => 
      client.publishJSON(params as unknown as Parameters<typeof client.publishJSON>[0]),
    safePublishJSON: async (params) => {
      try {
        const response = await client.publishJSON(params as unknown as Parameters<typeof client.publishJSON>[0]);
        // Extract message ID from response - QStash returns various response types
        const messageId = typeof response === 'object' && response !== null && 'messageId' in response
          ? String((response as { messageId: string }).messageId)
          : String(response);
        return {
          ok: true,
          id: messageId,
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

/**
 * QStash client - either real or stub based on token availability
 */
const client: QStashClient = hasToken ? createRealClient() : createStubClient();

export default client;

/**
 * Schedule an email job
 * @param email - Recipient email address
 * @param subject - Email subject
 * @param delay - Optional delay (e.g., "1h", "30m")
 * @returns Promise with result indicating success or failure
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
): Promise<PublishResult> {
  // Input validation
  if (!email || typeof email !== "string" || !email.trim()) {
    return {
      ok: false,
      error: "Invalid email: email must be a non-empty string",
    };
  }

  if (!subject || typeof subject !== "string" || !subject.trim()) {
    return {
      ok: false,
      error: "Invalid subject: subject must be a non-empty string",
    };
  }

  // Early return if no token
  if (!hasToken) {
    return {
      ok: false,
      error: "QStash is not configured. Please set QSTASH_TOKEN environment variable.",
    };
  }

  return client.safePublishJSON({
    api: {
      name: "email",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job
 * @param userId - User ID to process analytics for
 * @returns Promise with result indicating success or failure
 */
export async function scheduleAnalyticsJob(
  userId: string
): Promise<PublishResult> {
  // Input validation
  if (!userId || typeof userId !== "string" || !userId.trim()) {
    return {
      ok: false,
      error: "Invalid userId: userId must be a non-empty string",
    };
  }

  // Early return if no token
  if (!hasToken) {
    return {
      ok: false,
      error: "QStash is not configured. Please set QSTASH_TOKEN environment variable.",
    };
  }

  return client.safePublishJSON({
    api: {
      name: "analytics",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { userId },
  });
}

/**
 * Schedule a subscription check job
 * @param userId - User ID to check subscription for
 * @returns Promise with result indicating success or failure
 */
export async function scheduleSubscriptionCheck(
  userId: string
): Promise<PublishResult> {
  // Input validation
  if (!userId || typeof userId !== "string" || !userId.trim()) {
    return {
      ok: false,
      error: "Invalid userId: userId must be a non-empty string",
    };
  }

  // Early return if no token
  if (!hasToken) {
    return {
      ok: false,
      error: "QStash is not configured. Please set QSTASH_TOKEN environment variable.",
    };
  }

  return client.safePublishJSON({
    api: {
      name: "subscription-check",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { userId },
    delay: "1d", // Check daily
  });
}
