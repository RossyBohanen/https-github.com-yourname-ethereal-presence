# Ethereal Presence - Vercel Speed Insights Demo

A demonstration project showcasing Vercel Speed Insights integration for performance monitoring.

## 🚀 Features

- ✅ Vercel Speed Insights configured and ready to use
- 📊 Real-time performance monitoring
- 🎯 Core Web Vitals tracking
- 🔧 Multiple integration examples

## 📦 Installation

Install dependencies:

```bash
npm install
```

## 🛠️ Development

Start the development server:

```bash
npm run dev
```

## 🏗️ Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## ✨ Vercel Speed Insights Integration

This project includes two integration approaches for Vercel Speed Insights:

### 1. Framework-based Integration (Main Approach)

Located in `src/main.js`:

```javascript
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights on the client side
injectSpeedInsights();
```

**Key Points:**
- Import `injectSpeedInsights()` from `@vercel/speed-insights`
- Call it in your app's entry point
- Must run on the client side only
- Works with any JavaScript framework

### 2. Plain HTML Integration (Alternative)

See `public/plain-html-example.html` for the plain HTML approach:

```html
<script>
    window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

**Key Points:**
- No package installation required
- Add script tags directly to your HTML
- Works for static HTML sites
- Automatically tracks performance metrics

## 📊 What Speed Insights Tracks

- **LCP (Largest Contentful Paint):** Loading performance
- **FID (First Input Delay):** Interactivity
- **CLS (Cumulative Layout Shift):** Visual stability
- **TTFB (Time to First Byte):** Server response time

## 📝 Linting

Run the linter:

```bash
npm run lint
```

## 🔗 Resources

- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Core Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/performance/)

## 📄 License

MIT