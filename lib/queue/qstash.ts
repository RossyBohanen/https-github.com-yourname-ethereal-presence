import { Client } from "@upstash/qstash";
import { instrumentUpstash } from "@kubiks/otel-upstash-queues";

/**
 * Result type for QStash publish operations
 */
export interface QStashPublishResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Duration type for delays (e.g., "1h", "30m", "1d")
 */
type Duration = `${bigint}${"s" | "m" | "h" | "d"}`;

/**
 * QStash client with safe publish wrapper
 */
interface QStashClient {
  /**
   * Safely publish a JSON message to QStash
   * @param params - Publish parameters
   * @returns Result object with ok status, message id (if successful), or error message
   */
  safePublishJSON: (params: {
    url: string;
    body: Record<string, unknown>;
    delay?: Duration | number;
  }) => Promise<QStashPublishResult>;
  publishJSON: typeof Client.prototype.publishJSON;
}

const QSTASH_TOKEN = process.env.QSTASH_TOKEN || "";
const hasValidToken = QSTASH_TOKEN.trim().length > 0;

/**
 * Create a stub client that throws errors when used
 */
function createStubClient(): QStashClient {
  const stubError = () => {
    throw new Error(
      "QStash client is not configured. Set QSTASH_TOKEN environment variable to use QStash functionality. This is a server-only operation."
    );
  };

  return {
    safePublishJSON: async () => ({
      ok: false,
      error:
        "QStash client is not configured. Set QSTASH_TOKEN environment variable.",
    }),
    publishJSON: stubError as any,
  };
}

/**
 * Create a real QStash client with instrumentation
 */
function createRealClient(): QStashClient {
  const upstashClient = new Client({
    token: QSTASH_TOKEN,
  });

  // Add OpenTelemetry instrumentation
  try {
    instrumentUpstash(upstashClient);
  } catch (error) {
    // Instrumentation is optional, continue without it
    console.warn("Failed to instrument QStash client:", error);
  }

  return {
    safePublishJSON: async (params) => {
      try {
        const messageId = await upstashClient.publishJSON(params);
        return {
          ok: true,
          id: String(messageId),
        };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    publishJSON: upstashClient.publishJSON.bind(upstashClient),
  };
}

/**
 * QStash client instance - either real or stub depending on token availability
 */
const client: QStashClient = hasValidToken
  ? createRealClient()
  : createStubClient();

export default client;

/**
 * Schedule an email job
 * @param email - Recipient email address
 * @param subject - Email subject line
 * @param delay - Optional delay (e.g., "1h", "30m", "1d" or number of seconds)
 * @returns Result object indicating success or failure
 */
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: Duration | number
): Promise<QStashPublishResult> {
  // Input validation
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return {
      ok: false,
      error: "Invalid email address",
    };
  }

  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    return {
      ok: false,
      error: "Invalid subject - must be a non-empty string",
    };
  }

  if (!hasValidToken) {
    return {
      ok: false,
      error:
        "QStash is not configured. Set QSTASH_TOKEN environment variable to schedule email jobs.",
    };
  }

  const baseUrl = process.env.QSTASH_BASE_URL || "http://localhost:3000";
  return client.safePublishJSON({
    url: `${baseUrl}/api/queue/email`,
    body: { email, subject },
    delay,
  });
}

/**
 * Schedule an analytics job
 * @param userId - User ID to analyze
 * @returns Result object indicating success or failure
 */
export async function scheduleAnalyticsJob(
  userId: string
): Promise<QStashPublishResult> {
  // Input validation
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return {
      ok: false,
      error: "Invalid userId - must be a non-empty string",
    };
  }

  if (!hasValidToken) {
    return {
      ok: false,
      error:
        "QStash is not configured. Set QSTASH_TOKEN environment variable to schedule analytics jobs.",
    };
  }

  const baseUrl = process.env.QSTASH_BASE_URL || "http://localhost:3000";
  return client.safePublishJSON({
    url: `${baseUrl}/api/queue/analytics`,
    body: { userId },
  });
}

/**
 * Schedule a subscription check job
 * @param userId - User ID to check subscription for
 * @returns Result object indicating success or failure
 */
export async function scheduleSubscriptionCheck(
  userId: string
): Promise<QStashPublishResult> {
  // Input validation
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return {
      ok: false,
      error: "Invalid userId - must be a non-empty string",
    };
  }

  if (!hasValidToken) {
    return {
      ok: false,
      error:
        "QStash is not configured. Set QSTASH_TOKEN environment variable to schedule subscription checks.",
    };
  }

  const baseUrl = process.env.QSTASH_BASE_URL || "http://localhost:3000";
  return client.safePublishJSON({
    url: `${baseUrl}/api/queue/subscription-check`,
    body: { userId },
    delay: "1d", // Check daily
  });
}
