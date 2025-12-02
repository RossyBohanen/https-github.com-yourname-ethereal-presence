# Vercel Speed Insights Implementation Guide

This repository demonstrates how to integrate Vercel Speed Insights into various types of web applications.

## Overview

Vercel Speed Insights provides real-time performance metrics for your web applications. This guide covers implementation for both plain HTML sites and modern JavaScript frameworks.

## 🚀 Quick Start

### For Plain HTML Sites

For static HTML sites, no package installation is needed. Simply add the script tags directly to your HTML:

```html
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

**Example:** See `index.html` in the root directory for a complete working example.

### For Framework-Based Applications

1. **Install the package:**

```bash
# npm
npm install @vercel/speed-insights

# pnpm
pnpm add @vercel/speed-insights

# yarn
yarn add @vercel/speed-insights

# bun
bun add @vercel/speed-insights
```

2. **Import and inject in your app's entry point:**

```javascript
import { injectSpeedInsights } from '@vercel/speed-insights';

// Call this function in your entry point
injectSpeedInsights();
```

⚠️ **Important:** Speed Insights must run on the client side only. Ensure it's not executed during server-side rendering.

## 📚 Framework-Specific Examples

### React

**Option 1: In your entry point (main.jsx/main.tsx)**

```jsx
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
```

**Option 2: In your App component**

```jsx
import { useEffect } from 'react';
import { injectSpeedInsights } from '@vercel/speed-insights';

function App() {
  useEffect(() => {
    injectSpeedInsights();
  }, []);
  
  return <div>Your App</div>;
}
```

See: `examples/react/` for complete examples.

### Next.js

For Next.js, use the dedicated Next.js package component:

**App Router (app/layout.tsx):**

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Pages Router (pages/_app.tsx):**

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
```

See: `examples/nextjs/` for complete examples.

### Vue

**In your main entry file (main.js):**

```javascript
import { createApp } from 'vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

createApp(App).mount('#app');
```

**Or in a component using onMounted:**

```vue
<script>
import { onMounted } from 'vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

export default {
  setup() {
    onMounted(() => {
      injectSpeedInsights();
    });
  }
}
</script>
```

See: `examples/vue/` for complete examples.

### Svelte

**In your main entry file (main.js):**

```javascript
import App from './App.svelte';
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

const app = new App({
  target: document.getElementById('app')
});
```

**Or in a component using onMount:**

```svelte
<script>
  import { onMount } from 'svelte';
  import { injectSpeedInsights } from '@vercel/speed-insights';

  onMount(() => {
    injectSpeedInsights();
  });
</script>
```

See: `examples/svelte/` for complete examples.

## 🎯 Key Points

1. **Client-side only**: Speed Insights must run in the browser, not during SSR
2. **Call once**: Only call `injectSpeedInsights()` once in your application
3. **Entry point**: Best practice is to call it in your app's main entry point
4. **No configuration needed**: Works out of the box when deployed to Vercel

## 📦 Repository Structure

```
.
├── index.html              # Plain HTML example with Speed Insights
├── package.json            # Package configuration with @vercel/speed-insights
├── SPEED_INSIGHTS.md       # This documentation file
└── examples/
    ├── react/              # React implementation examples
    ├── nextjs/             # Next.js implementation examples
    ├── vue/                # Vue implementation examples
    └── svelte/             # Svelte implementation examples
```

## 📖 Additional Resources

- [Official Vercel Speed Insights Documentation](https://vercel.com/docs/concepts/speed-insights)
- [Speed Insights Package on npm](https://www.npmjs.com/package/@vercel/speed-insights)

## ✅ Verification

After implementation, your Speed Insights should:
- Automatically track Web Vitals metrics
- Send data to Vercel when deployed
- Work seamlessly without additional configuration

Monitor your metrics in the Vercel dashboard after deployment.
