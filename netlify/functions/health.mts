/**
 * Health Check Function
 *
 * Simple health check endpoint to verify the functions are running correctly.
 * Used for monitoring and deployment verification.
 */

import type { Context, Config } from "@netlify/functions";

interface HealthResponse {
  status: "healthy";
  timestamp: string;
  environment: string;
}

export default async (req: Request, context: Context): Promise<Response> => {
  const health: HealthResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: Netlify.env.get("NODE_ENV") || "development",
  };

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
import type { Context, Config } from "@netlify/functions";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    name: string;
    status: "pass" | "fail";
    message?: string;
  }[];
}

const startTime = Date.now();

export default async (_req: Request, context: Context): Promise<Response> => {
  const checks = [
    { name: "functions", status: "pass" as const },
    { name: "geo-data", status: context.geo ? "pass" as const : "fail" as const },
  ];

  const allPassing = checks.every((check) => check.status === "pass");

  const response: HealthResponse = {
    status: allPassing ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.COMMIT_REF || "development",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: allPassing ? 200 : 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
};

export const config: Config = {
  path: "/api/health",
};
