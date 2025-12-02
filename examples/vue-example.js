// Vue.js Example - Speed Insights Integration
// Add this to your main.js or main.ts entry point

import { createApp } from 'vue';
import App from './App.vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = createApp(App);

// Inject Speed Insights on client side
app.mount('#app');
injectSpeedInsights();
