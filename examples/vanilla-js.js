// Vanilla JavaScript Example - Speed Insights Integration
// Add this to your main JavaScript file

import { injectSpeedInsights } from '@vercel/speed-insights';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Your app initialization code here
  console.log('App initialized');
  
  // Inject Speed Insights
  injectSpeedInsights();
});
