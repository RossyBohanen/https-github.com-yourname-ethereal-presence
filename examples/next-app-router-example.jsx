/**
 * Next.js App Router Example - Vercel Web Analytics Integration
 * 
 * For Next.js 13+ with App Router, add Analytics to your root layout.
 * File: app/layout.js or app/layout.tsx
 */

import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Add Analytics component at the end of body */}
        <Analytics />
      </body>
    </html>
  );
}
