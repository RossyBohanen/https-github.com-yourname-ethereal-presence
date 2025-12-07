# Therapist Portal Backend Libraries (Template Code)

**⚠️ IMPORTANT:** This directory contains **template/reference code only** and is **not currently active** in this project.

## Overview

This directory is part of the **Therapist Portal Template** - a comprehensive backend system demonstrating:
- 🔐 Authentication (`auth/`)
- 💳 Billing & Subscriptions (`billing/`)
- 🗄️ Database Schema (`db/`)
- 📧 Email Services (`email/`)
- 🔄 Background Workflows (`workflows/`)

## Status

- **Active in Production**: ❌ No
- **TypeScript Compilation**: ❌ Excluded (see `tsconfig.json`)
- **Dependencies Installed**: ❌ No
- **Purpose**: Reference implementation and future development template

## Complete Documentation

For comprehensive documentation including:
- Architecture overview
- Required dependencies
- Integration guide
- Database schema details
- Security considerations
- Testing recommendations

**See: [THERAPIST_PORTAL_TEMPLATE.md](../THERAPIST_PORTAL_TEMPLATE.md)**

## Working Functions

The actual **active** serverless functionality is in:
- `/netlify/functions/` - Netlify serverless functions (hello.mts, health.mts)
- `/netlify/edge-functions/` - Netlify edge functions (geo-personalization.ts)

These are configured in `netlify.toml` and work with the current Vite + React deployment.
