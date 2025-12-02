/**
 * React Example - Vercel Web Analytics Integration
 * 
 * For React applications, you can use the Analytics component
 * or the inject() function.
 */

import React from 'react';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to Ethereal Presence</h1>
      <p>This React app includes Vercel Web Analytics.</p>
      
      {/* Add Analytics component before closing body tag */}
      <Analytics />
    </div>
  );
}

export default App;

/**
 * Alternative approach using inject() in your entry point:
 * 
 * // In your main.jsx or index.jsx:
 * import { inject } from '@vercel/analytics';
 * 
 * inject();
 * 
 * ReactDOM.render(<App />, document.getElementById('root'));
 */
