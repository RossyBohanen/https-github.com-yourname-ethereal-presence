/**
 * Ethereal Presence Application Entry Point
 * 
 * This file demonstrates how to integrate Vercel Web Analytics
 * in a JavaScript application using the inject() function.
 */

import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
// Note: inject() must be called on the client side
// It will automatically track page views and send analytics data
inject();

console.log('Vercel Web Analytics initialized successfully');
console.log('Analytics will only track data in production deployments');

// Your application code goes here
// Example: Initialize your app, set up event listeners, etc.

/**
 * Example: Track custom events (if needed)
 * You can import 'track' function for custom event tracking:
 * 
 * import { track } from '@vercel/analytics';
 * 
 * track('custom_event_name', {
 *   property1: 'value1',
 *   property2: 'value2'
 * });
 */

export default function initApp() {
  console.log('Application initialized');
  // Add your application initialization logic here
}

// Initialize the app
initApp();
