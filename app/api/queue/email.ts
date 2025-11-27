import { NextRequest, NextResponse } from "next/server";
import resend from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  try {
    const { email, subject } = await request.json();

    const result = await resend.emails.send({
      from: "noreply@ethereal-presence.com",
      to: email,
      subject,
      html: `<h1>${subject}</h1><p>This is an automated email.</p>`,
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
