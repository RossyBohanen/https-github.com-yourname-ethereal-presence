# Ethereal Presence

A demo project showcasing **Vercel Web Analytics** integration for different types of web applications.

## 🚀 Quick Start

This repository demonstrates how to integrate Vercel Web Analytics in various scenarios:

### 1. Plain HTML Site

For simple HTML sites, no npm packages are required. Just add the script tag:

```html
<!-- Add before closing </body> tag -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

See `index.html` for a complete example.

### 2. JavaScript/Node.js Application

For applications using bundlers or build tools:

```bash
# Install the analytics package
npm install @vercel/analytics
# or
pnpm add @vercel/analytics
# or
yarn add @vercel/analytics
# or
bun add @vercel/analytics
```

Then import and call `inject()` in your app's entry point:

```javascript
import { inject } from '@vercel/analytics';

inject();
```

See `app.js` for a complete example.

### 3. Framework-Specific Integration

#### React
```jsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app content */}
      <Analytics />
    </>
  );
}
```

#### Next.js (App Router)
```jsx
// app/layout.js
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Next.js (Pages Router)
```jsx
// pages/_app.js
import { Analytics } from '@vercel/analytics/next';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

See the `examples/` directory for more framework-specific implementations.

## 📦 Installation

```bash
# Install dependencies
npm install

# Run the example app
npm start

# Build (if applicable)
npm run build
```

## 🔑 Important Notes

1. **Client-Side Only**: The `inject()` function must run on the client side
2. **No Route Support**: `inject()` does not include route change tracking
3. **Vercel Deployment Required**: Analytics only work when deployed to Vercel
4. **Production Only**: Analytics data is not tracked in development mode
5. **Enable in Dashboard**: You must enable Web Analytics in your Vercel project dashboard

## 📚 Resources

- [Vercel Web Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Analytics Quickstart](https://vercel.com/docs/analytics/quickstart)
- [Advanced Configuration](https://vercel.com/docs/analytics/package)
- [GitHub Repository](https://github.com/vercel/analytics)

## 🎯 Features

- ✅ Privacy-friendly analytics
- ✅ Real-time traffic insights
- ✅ No cookies required
- ✅ Automatic page view tracking
- ✅ Web Vitals monitoring
- ✅ Custom event tracking

## 📖 Usage Guide

### Basic Setup

1. Deploy your project to Vercel
2. Enable Web Analytics in your project settings
3. Add the analytics integration using one of the methods above
4. Deploy your changes
5. Visit your site to start collecting data

### Custom Event Tracking

You can track custom events using the `track` function:

```javascript
import { track } from '@vercel/analytics';

track('button_clicked', {
  location: 'header',
  label: 'Sign Up'
});
```

### Configuration Options

```javascript
import { inject } from '@vercel/analytics';

inject({
  mode: 'production', // Force production mode
  debug: false,       // Enable debug logging
});
```

## 📄 License

MIT