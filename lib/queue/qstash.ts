import { Client } from "@upstash/qstash";
import { instrumentUpstash } from "@kubiks/otel-upstash-queues";

/**
 * Structured publish result returned to callers so they can react programmatically.
 */
export type PublishResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

type UpstashClientLike = {
  publishJSON?: (opts: any) => Promise<string | { id?: string } | void>;
};

const QSTASH_TOKEN = process.env.QSTASH_TOKEN ?? "";
const QSTASH_BASE_URL = process.env.QSTASH_BASE_URL ?? "http://localhost:3000";

let client: UpstashClientLike;
let isRealClient = false;

/**
 * Initialize real client if token exists; otherwise provide a stub client that fails fast.
 */
if (QSTASH_TOKEN && QSTASH_TOKEN.trim() !== "") {
  client = new Client({ token: QSTASH_TOKEN });
  try {
    // Instrumentation is optional and must not throw on failure
    instrumentUpstash(client as any);
  } catch (err) {
    // Do not fail app if instrumentation fails
    // eslint-disable-next-line no-console
    console.warn("[qstash] instrumentation failed:", (err as Error).message);
  }
  isRealClient = true;
} else {
  // Stub client that throws a clear error to prevent accidental use in browser or unconfigured environments
  client = {
    publishJSON: async () => {
      throw new Error(
        "QStash client not configured: QSTASH_TOKEN is missing. Publishing is a server-only operation."
      );
    },
  };
  isRealClient = false;
}

export default client as UpstashClientLike;

/**
 * Normalize the publish result and handle errors centrally.
 */
export async function safePublishJSON(payload: any): Promise<PublishResult> {
  if (!isRealClient) {
    return {
      ok: false,
      error: "QStash not configured (QSTASH_TOKEN missing). Operation not performed.",
    };
  }

  try {
    const res: any = await client.publishJSON?.(payload);
    const id = typeof res === "string" ? res : res?.id ?? undefined;
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: (err as Error).message || String(err) };
  }
}

/* ---------- Validation helpers ---------- */

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(v: unknown): v is string {
  if (typeof v !== "string") return false;
  // Basic email validation: allows most valid emails while rejecting obvious invalid formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(v) && v.length <= 254; // RFC 5321 max length
}

/* ---------- Public schedule functions ---------- */

/**
 * Schedule an email job via QStash.
 * Returns an object with { ok, id?, error? } so callers can respond accordingly.
 */
export async function scheduleEmailJob(
  email: unknown,
  subject: unknown,
  delay?: unknown
): Promise<PublishResult> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email provided." };
  }
  if (!isNonEmptyString(subject)) {
    return { ok: false, error: "Invalid subject provided." };
  }
  const payload: any = {
    api: {
      name: "email",
      baseUrl: QSTASH_BASE_URL,
    },
    body: { email, subject },
  };
  if (typeof delay === "string" && delay.trim() !== "") payload.delay = delay;
  return safePublishJSON(payload);
}

/**
 * Schedule an analytics job.
 */
export async function scheduleAnalyticsJob(userId: unknown): Promise<PublishResult> {
  if (!isNonEmptyString(userId)) {
    return { ok: false, error: "Invalid userId provided." };
  }
  const payload = {
    api: { name: "analytics", baseUrl: QSTASH_BASE_URL },
    body: { userId },
  };
  return safePublishJSON(payload);
}

/**
 * Schedule a subscription-check job (default: 1d delay).
 */
export async function scheduleSubscriptionCheck(userId: unknown): Promise<PublishResult> {
  if (!isNonEmptyString(userId)) {
    return { ok: false, error: "Invalid userId provided." };
  }
  const payload = {
    api: { name: "subscription-check", baseUrl: QSTASH_BASE_URL },
    body: { userId },
    delay: "1d",
  };
  return safePublishJSON(payload);
}
