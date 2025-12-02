import App from './App.svelte';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Inject Speed Insights at the entry point
injectSpeedInsights();

const app = new App({
  target: document.getElementById('app')
});

export default app;
