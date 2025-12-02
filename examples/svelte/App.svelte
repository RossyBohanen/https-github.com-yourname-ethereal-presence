<script>
  import { onMount } from 'svelte';
  import { injectSpeedInsights } from '@vercel/speed-insights';

  // Alternatively, inject Speed Insights on component mount
  onMount(() => {
    injectSpeedInsights();
  });
</script>

<div id="app">
  <header>
    <h1>✨ Ethereal Presence</h1>
    <p>Svelte app with Vercel Speed Insights</p>
  </header>
  <main>
    <div class="content">
      <p>Speed Insights is now tracking performance metrics.</p>
    </div>
  </main>
</div>
