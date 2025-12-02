import React, { useEffect } from 'react';
import { injectSpeedInsights } from '@vercel/speed-insights';

function App() {
  useEffect(() => {
    // Inject Speed Insights on component mount (client-side only)
    injectSpeedInsights();
  }, []);

  return (
    <div className="App">
      <header>
        <h1>✨ Ethereal Presence</h1>
        <p>React app with Vercel Speed Insights</p>
      </header>
      <main>
        <div className="content">
          <p>Speed Insights is now tracking performance metrics.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
