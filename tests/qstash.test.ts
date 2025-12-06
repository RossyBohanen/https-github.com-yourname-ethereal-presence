import { describe, it, expect } from "vitest";
import * as qstashModule from "../lib/queue/qstash";

describe("qstash wrapper", () => {
  it("returns error when QSTASH_TOKEN is not configured", async () => {
    const res = await qstashModule.scheduleEmailJob("invalid-email", "subj");
    expect(res.ok).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("validates inputs for scheduleEmailJob", async () => {
    const res = await qstashModule.scheduleEmailJob("user@example.com", "");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/subject/i);
  });

  it("validates inputs for scheduleAnalyticsJob", async () => {
    const res = await qstashModule.scheduleAnalyticsJob("");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/userId/i);
  });
});
