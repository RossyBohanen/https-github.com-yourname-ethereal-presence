import { createApp } from 'vue';
import App from './App.vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Inject Speed Insights at the entry point
injectSpeedInsights();

createApp(App).mount('#app');
