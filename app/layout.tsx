import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Ethereal Presence',
  description: 'API services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
