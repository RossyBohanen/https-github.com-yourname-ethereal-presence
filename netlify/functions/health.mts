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
    },
  });
};

export const config: Config = {
  path: "/api/health",
};
