import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethereal Presence",
  description: "Next.js with OpenTelemetry and Kubiks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
