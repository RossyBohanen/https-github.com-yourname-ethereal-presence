/**
 * QStash Webhook Verification
 *
 * Verifies incoming webhook requests from Upstash QStash
 * to prevent unauthorized job injection.
 */

import { Receiver } from "@upstash/qstash";
import { getOptionalEnv } from "../env/validation";

// Initialize QStash receiver for signature verification
let receiver: Receiver | null = null;

function getReceiver(): Receiver | null {
  if (receiver) return receiver;

  const currentSigningKey = getOptionalEnv("QSTASH_CURRENT_SIGNING_KEY");
  const nextSigningKey = getOptionalEnv("QSTASH_NEXT_SIGNING_KEY");

  if (!currentSigningKey) {
    console.warn("QStash signing keys not configured. Webhook verification disabled.");
    return null;
  }

  receiver = new Receiver({
    currentSigningKey,
    nextSigningKey: nextSigningKey || currentSigningKey,
  });

  return receiver;
}

/**
 * Verification result
 */
interface VerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify a QStash webhook request
 *
 * @param request - The incoming request
 * @param body - The request body as a string
 * @returns Verification result
 */
export async function verifyQStashWebhook(
  request: Request,
  body: string
): Promise<VerificationResult> {
  const recv = getReceiver();

  // If no receiver configured, allow in development but block in production
  if (!recv) {
    if (process.env.NODE_ENV === "production") {
      return {
        valid: false,
        error: "QStash verification not configured for production",
      };
    }
    console.warn("QStash verification skipped in development");
    return { valid: true };
  }

  try {
    // Get signature from headers
    const signature = request.headers.get("upstash-signature");

    if (!signature) {
      return {
        valid: false,
        error: "Missing upstash-signature header",
      };
    }

    // Verify the signature
    const isValid = await recv.verify({
      signature,
      body,
      url: request.url,
    });

    if (!isValid) {
      return {
        valid: false,
        error: "Invalid QStash signature",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("QStash verification error:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Middleware helper for Netlify Functions
 * Wraps a handler with QStash verification
 */
export function withQStashVerification<T>(
  handler: (body: T, request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    // Read body once for verification and parsing
    const bodyText = await request.text();

    // Verify the request
    const verification = await verifyQStashWebhook(request, bodyText);

    if (!verification.valid) {
      console.error("QStash verification failed:", verification.error);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: verification.error,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse the body and call the handler
    try {
      const body = JSON.parse(bodyText) as T;
      return handler(body, request);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

/**
 * Get QStash message metadata from headers
 */
export function getQStashMetadata(request: Request): {
  messageId?: string;
  retryCount?: number;
  scheduleId?: string;
  notBefore?: number;
} {
  return {
    messageId: request.headers.get("upstash-message-id") || undefined,
    retryCount: parseInt(request.headers.get("upstash-retried") || "0", 10),
    scheduleId: request.headers.get("upstash-schedule-id") || undefined,
    notBefore: request.headers.get("upstash-not-before")
      ? parseInt(request.headers.get("upstash-not-before")!, 10)
      : undefined,
  };
}
