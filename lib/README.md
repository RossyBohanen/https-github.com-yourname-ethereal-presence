# Library Directory (Not Active)

**Note:** This directory contains example/template code that is **not currently used** in this project.

This is a Vite + React project, but these files contain Next.js framework code with dependencies that are not installed:
- drizzle-orm / postgres
- better-auth
- autumn (billing)
- resend (email)
- @upstash/workflow
- @kubiks/* (OpenTelemetry instrumentation)

The TypeScript configuration (`tsconfig.json`) explicitly **excludes** this directory from compilation.

## Working Functions

The actual working serverless functionality is in:
- `/netlify/functions/` - Netlify serverless functions
- `/netlify/edge-functions/` - Netlify edge functions

If you need the functionality shown in these example files, you would need to:
1. Install the required dependencies
2. Update `tsconfig.json` to include this directory
3. Adapt the code to work with the Netlify deployment platform
