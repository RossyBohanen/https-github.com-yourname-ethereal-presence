<template>
  <div id="app">
    <header>
      <h1>✨ Ethereal Presence</h1>
      <p>Vue app with Vercel Speed Insights</p>
    </header>
    <main>
      <div class="content">
        <p>Speed Insights is now tracking performance metrics.</p>
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

export default {
  name: 'App',
  setup() {
    // Alternatively, inject Speed Insights on component mount
    onMounted(() => {
      injectSpeedInsights();
    });
  }
}
</script>
