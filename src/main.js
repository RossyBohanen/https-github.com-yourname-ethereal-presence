/**
 * Main application entry point
 * Initializes Vercel Speed Insights for performance monitoring
 */

import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights on the client side
// This will automatically collect and send performance metrics to Vercel
injectSpeedInsights();

console.log('✅ Vercel Speed Insights initialized');

// Your application code goes here
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application loaded successfully');
});
