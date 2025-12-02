// React Example - Speed Insights Integration
// Add this to your main App component or entry point

import { injectSpeedInsights } from '@vercel/speed-insights';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Inject Speed Insights on client side only
    injectSpeedInsights();
  }, []);

  return (
    <div className="App">
      <h1>Welcome to Ethereal Presence</h1>
      <p>Speed Insights is now tracking performance metrics!</p>
    </div>
  );
}

export default App;
