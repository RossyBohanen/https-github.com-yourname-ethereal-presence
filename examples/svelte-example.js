// Svelte Example - Speed Insights Integration
// Add this to your main.js entry point

import App from './App.svelte';
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = new App({
  target: document.getElementById('app')
});

// Inject Speed Insights on client side
injectSpeedInsights();

export default app;
