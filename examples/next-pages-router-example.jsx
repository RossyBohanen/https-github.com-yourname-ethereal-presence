/**
 * Next.js Pages Router Example - Vercel Web Analytics Integration
 * 
 * For Next.js with Pages Router, add Analytics to your _app.js
 * File: pages/_app.js or pages/_app.tsx
 */

import { Analytics } from '@vercel/analytics/next';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      
      {/* Add Analytics component */}
      <Analytics />
    </>
  );
}

export default MyApp;
