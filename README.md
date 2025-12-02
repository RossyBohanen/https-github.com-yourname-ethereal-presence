# Ethereal Presence

A web application with Vercel Speed Insights integration for monitoring and optimizing performance.

## 🚀 Features

- ✅ Vercel Speed Insights configured and ready to use
- 📊 Real-time performance monitoring
- 🎯 Core Web Vitals tracking
- 🔧 Multiple framework examples included

## 📦 Installation

This project includes `@vercel/speed-insights` as a dependency. Install it using your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## 🎨 Implementation

### Plain HTML Site (Current Setup)

For plain HTML sites, Speed Insights is added directly via script tags in `index.html`:

```html
<!-- Vercel Speed Insights -->
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

**No package installation needed** for plain HTML - the scripts are served by Vercel's CDN.

### Framework Integration

For framework-based projects, you'll need to:

1. **Install the package:**
   ```bash
   npm install @vercel/speed-insights
   ```

2. **Import and configure in your entry point:**

   Choose the appropriate example for your framework:

#### React
See `examples/react-example.jsx`
```jsx
import { injectSpeedInsights } from '@vercel/speed-insights';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    injectSpeedInsights();
  }, []);
  // ... rest of your component
}
```

#### Next.js (App Router)
See `examples/nextjs-app-router.tsx`
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### Next.js (Pages Router)
See `examples/nextjs-pages.tsx`
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

#### Vue.js
See `examples/vue-example.js`
```js
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = createApp(App);
app.mount('#app');
injectSpeedInsights();
```

#### Svelte
See `examples/svelte-example.js`
```js
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = new App({ target: document.getElementById('app') });
injectSpeedInsights();
```

#### Vanilla JavaScript
See `examples/vanilla-js.js`
```js
import { injectSpeedInsights } from '@vercel/speed-insights';

document.addEventListener('DOMContentLoaded', () => {
  injectSpeedInsights();
});
```

## 🔑 Important Notes

- **Client-side only**: Speed Insights must run on the client side only
- **Automatic tracking**: Once configured, Speed Insights automatically tracks Core Web Vitals
- **Vercel deployment**: Full functionality requires deployment on Vercel platform
- **No configuration needed**: Works out of the box with sensible defaults

## 🛠️ Development

To run the plain HTML site locally:

```bash
npm run dev
```

This will start a local server at `http://localhost:3000` (or similar).

## 📚 Resources

- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Core Web Vitals](https://web.dev/vitals/)
- [@vercel/speed-insights on npm](https://www.npmjs.com/package/@vercel/speed-insights)

## 📝 License

MIT
