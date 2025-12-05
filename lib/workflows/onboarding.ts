import { serve } from "@upstash/workflow/nextjs";
import { instrumentWorkflow } from "@kubiks/otel-upstash-workflow";
import db from "@/lib/db/client";
import resend from "@/lib/email/resend";
import autumn from "@/lib/billing/autumn";

export const { POST } = serve<{ userId: string; email: string; name: string }>(
  async (context) => {
    const { userId, email, name } = context.requestPayload;

    // Step 1: Send welcome email
    await context.run("send-welcome-email", async () => {
      await resend.emails.send({
        from: "onboarding@ethereal-presence.com",
        to: email,
        subject: "Welcome to Ethereal Presence!",
        html: `<h1>Welcome ${name}!</h1>`,
      });
    });

    // Step 2: Create free trial subscription
    await context.run("create-subscription", async () => {
      const subscription = await autumn.features.check({
        customerId: userId,
        featureId: "trial_access",
      });
      return subscription;
    });

    // Step 3: Log onboarding in database
    await context.run("log-onboarding", async () => {
      // Record in analytics table
      console.log(`User ${userId} onboarded successfully`);
    });

    // Step 4: Schedule follow-up email after 7 days
    await context.sleep("7d");
    await context.run("send-followup-email", async () => {
      await resend.emails.send({
        from: "support@ethereal-presence.com",
        to: email,
        subject: "How are you loving Ethereal Presence?",
        html: `<h1>We'd love your feedback!</h1>`,
      });
    });

    return { success: true, userId };
  }
);

// Add instrumentation
instrumentWorkflow({ serve });
