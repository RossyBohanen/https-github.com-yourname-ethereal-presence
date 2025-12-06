# App Directory (Not Active)

**Note:** This directory contains example/template code that is **not currently used** in this project.

This is a Vite + React project, but these files contain Next.js API route code with dependencies that are not installed.

The TypeScript configuration does not include this directory, and these routes are not functional.

## Working API Functions

The actual working serverless API functionality is in:
- `/netlify/functions/` - Netlify serverless functions (e.g., `hello.mts`, `health.mts`)
- `/netlify/edge-functions/` - Netlify edge functions (e.g., `geo-personalization.ts`)

These Netlify functions are properly configured in `netlify.toml` and work with the deployment platform.
