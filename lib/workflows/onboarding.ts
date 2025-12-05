/**
 * Onboarding Workflow
 *
 * A multi-step workflow that orchestrates the user onboarding process.
 * Uses Upstash Workflow for durable, step-based execution.
 *
 * Steps:
 * 1. Send welcome email
 * 2. Grant trial subscription access
 * 3. Log onboarding event
 * 4. Schedule follow-up email (7 days later)
 */

import { serve, WorkflowContext } from "@upstash/workflow";
import { Resend } from "resend";

// Initialize Resend client for email sending
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }
  return new Resend(apiKey);
}

// Onboarding workflow payload type
export interface OnboardingPayload {
  userId: string;
  email: string;
  name: string;
}

// Onboarding workflow definition
export const onboardingWorkflow = serve<OnboardingPayload>(
  async (context: WorkflowContext<OnboardingPayload>) => {
    const { userId, email, name } = context.requestPayload;

    // Step 1: Send welcome email
    await context.run("send-welcome-email", async () => {
      const resend = getResendClient();
      await resend.emails.send({
        from: "onboarding@ethereal-presence.com",
        to: email,
        subject: "Welcome to Ethereal Presence!",
        html: `
          <h1>Welcome ${name}!</h1>
          <p>Thank you for joining Ethereal Presence. We're here to support you on your healing journey.</p>
          <p>Your free trial gives you access to all our therapeutic VR experiences.</p>
        `,
      });
      console.log(`Welcome email sent to ${email}`);
    });

    // Step 2: Grant trial subscription access
    await context.run("grant-trial-access", async () => {
      // In production, this would call the billing provider
      // For now, we log the trial activation
      console.log(`Trial access granted for user ${userId}`);
      return { userId, trialActivated: true, trialDays: 14 };
    });

    // Step 3: Log onboarding completion
    await context.run("log-onboarding", async () => {
      console.log(`User ${userId} (${email}) onboarded successfully at ${new Date().toISOString()}`);
      return { userId, onboardedAt: Date.now() };
    });

    // Step 4: Wait 7 days, then send follow-up email
    await context.sleep("follow-up-delay", 60 * 60 * 24 * 7); // 7 days in seconds

    await context.run("send-followup-email", async () => {
      const resend = getResendClient();
      await resend.emails.send({
        from: "support@ethereal-presence.com",
        to: email,
        subject: "How is your healing journey going?",
        html: `
          <h1>Hi ${name},</h1>
          <p>It's been a week since you joined Ethereal Presence. We'd love to hear about your experience!</p>
          <p>If you have any questions or need support, we're here for you.</p>
        `,
      });
      console.log(`Follow-up email sent to ${email}`);
    });

    return { success: true, userId, completedAt: Date.now() };
  },
  {
    // Workflow configuration
    retries: 3,
  }
);
