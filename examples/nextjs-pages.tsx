// Next.js Pages Router Example (pages/_app.tsx)
// For Next.js with Pages Router

import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
