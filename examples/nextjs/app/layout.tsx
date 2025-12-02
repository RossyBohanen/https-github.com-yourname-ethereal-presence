import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Add Speed Insights component for Next.js */}
        <SpeedInsights />
      </body>
    </html>
  );
}
