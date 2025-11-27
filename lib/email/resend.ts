import { Resend } from "resend";
import { instrumentResend } from "@kubiks/otel-resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Add OpenTelemetry instrumentation
instrumentResend(resend);

export default resend;

// Email templates
export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: "onboarding@ethereal-presence.com",
    to: email,
    subject: "Welcome to Ethereal Presence!",
    html: `<h1>Welcome ${name}!</h1><p>Thank you for joining us.</p>`,
  });
}

export async function sendUpgradeEmail(email: string, planName: string) {
  return resend.emails.send({
    from: "billing@ethereal-presence.com",
    to: email,
    subject: `Upgraded to ${planName}!`,
    html: `<h1>Plan Upgrade Successful!</h1><p>You've upgraded to ${planName}.</p>`,
  });
}

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  return resend.emails.send({
    from: "noreply@ethereal-presence.com",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
}
