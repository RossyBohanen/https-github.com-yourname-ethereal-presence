import { Client } from "@upstash/qstash";
import { instrumentUpstash } from "@kubiks/otel-upstash-queues";

const client = new Client({
  token: process.env.QSTASH_TOKEN || "",
});

// Add OpenTelemetry instrumentation
instrumentUpstash(client);

export default client;

// Job operations
export async function scheduleEmailJob(
  email: string,
  subject: string,
  delay?: string
) {
  const messageId = await client.publishJSON({
    api: {
      name: "email",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { email, subject },
    delay,
  });
  return messageId;
}

export async function scheduleAnalyticsJob(userId: string) {
  const messageId = await client.publishJSON({
    api: {
      name: "analytics",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { userId },
  });
  return messageId;
}

export async function scheduleSubscriptionCheck(userId: string) {
  const messageId = await client.publishJSON({
    api: {
      name: "subscription-check",
      baseUrl: process.env.QSTASH_BASE_URL || "http://localhost:3000",
    },
    body: { userId },
    delay: "1d", // Check daily
  });
  return messageId;
}
