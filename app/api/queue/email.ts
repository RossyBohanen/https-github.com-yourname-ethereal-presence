import { NextRequest, NextResponse } from "next/server";
import resend from "@/lib/email/resend";
import { verifyQStashWebhook, getQStashMetadata } from "@/lib/queue/verification";
import { logAuditEvent, AUDIT_EVENTS } from "@/lib/audit/logger";

export async function POST(request: NextRequest) {
  try {
    // Read body for verification
    const bodyText = await request.text();

    // Verify QStash signature
    const verification = await verifyQStashWebhook(request as unknown as Request, bodyText);
    if (!verification.valid) {
      console.error("QStash verification failed:", verification.error);
      return NextResponse.json(
        { error: "Unauthorized", message: verification.error },
        { status: 401 }
      );
    }

    // Get QStash metadata for logging
    const metadata = getQStashMetadata(request as unknown as Request);

    // Parse the verified body
    const { email, subject } = JSON.parse(bodyText);

    const result = await resend.emails.send({
      from: "noreply@ethereal-presence.com",
      to: email,
      subject,
      html: `<h1>${subject}</h1><p>This is an automated email.</p>`,
    });

    // Log successful email send
    console.log("Email sent successfully", {
      messageId: result.data?.id,
      qstashMessageId: metadata.messageId,
      retryCount: metadata.retryCount,
    });

    return NextResponse.json({ success: true, messageId: result.data?.id });
  } catch (error) {
    console.error("Email queue error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
