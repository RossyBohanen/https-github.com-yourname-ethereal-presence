import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;

/**
 * Sanitizes user input for safe HTML rendering in emails.
 * Prevents HTML injection attacks by escaping special characters.
 */
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Validates email address format.
 * Prevents email header injection attacks.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !email.includes("\n") && !email.includes("\r");
}

// Email templates with input sanitization
export async function sendWelcomeEmail(email: string, name: string) {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address");
  }
  const safeName = sanitizeHtml(name);
  return resend.emails.send({
    from: "onboarding@ethereal-presence.com",
    to: email,
    subject: "Welcome to Ethereal Presence!",
    html: `<h1>Welcome ${safeName}!</h1><p>Thank you for joining us.</p>`,
  });
}

export async function sendUpgradeEmail(email: string, planName: string) {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address");
  }
  const safePlanName = sanitizeHtml(planName);
  return resend.emails.send({
    from: "billing@ethereal-presence.com",
    to: email,
    subject: `Upgraded to ${safePlanName}!`,
    html: `<h1>Plan Upgrade Successful!</h1><p>You've upgraded to ${safePlanName}.</p>`,
  });
}

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address");
  }
  // Validate reset link is a proper URL and from expected domain
  try {
    const url = new URL(resetLink);
    const allowedOrigin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const allowedHost = new URL(allowedOrigin).host;
    if (url.host !== allowedHost) {
      throw new Error("Invalid reset link domain");
    }
  } catch {
    throw new Error("Invalid reset link URL");
  }
  return resend.emails.send({
    from: "noreply@ethereal-presence.com",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
}
