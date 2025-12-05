/**
 * Onboarding Workflow Function
 *
 * Netlify function that exposes the onboarding workflow endpoint.
 * This function handles the multi-step user onboarding process using
 * Upstash Workflow for durable execution.
 *
 * Workflow Steps:
 * 1. Send welcome email
 * 2. Grant trial subscription access
 * 3. Log onboarding event
 * 4. Schedule follow-up email (7 days later)
 */

import type { Context, Config } from "@netlify/functions";
import { onboardingWorkflow, type OnboardingPayload } from "../../lib/workflows/onboarding";

export default async (req: Request, context: Context): Promise<Response> => {
  // The workflow handler expects a POST request with the payload
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
        message: "This endpoint only accepts POST requests",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Allow": "POST",
        },
      }
    );
  }

  try {
    // Validate that required environment variables are set
    if (!Netlify.env.get("QSTASH_TOKEN")) {
      console.error("QSTASH_TOKEN environment variable is not set");
      return new Response(
        JSON.stringify({
          error: "Configuration error",
          message: "Workflow service is not properly configured",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delegate to the workflow handler
    return await onboardingWorkflow(req);
  } catch (error) {
    console.error("Onboarding workflow error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process onboarding workflow",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config: Config = {
  path: "/api/workflows/onboarding",
};
