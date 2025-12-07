# Therapist Portal API Routes (Template Code)

**⚠️ IMPORTANT:** This directory contains **template/reference code only** and is **not currently active** in this project.

## Overview

This directory is part of the **Therapist Portal Template** - containing Next.js-style API routes for:
- 🔐 Authentication endpoints (`api/auth/`)
- 💳 Billing endpoints (`api/billing/`)
- 📨 Queue/workflow endpoints (`api/queue/`)

## Status

- **Active in Production**: ❌ No
- **Framework**: Next.js API Routes (not compatible with current Vite setup)
- **Dependencies Installed**: ❌ No
- **Purpose**: Reference implementation and future development template

## Complete Documentation

For comprehensive documentation including:
- API route descriptions
- Required dependencies
- Integration guide with Next.js or Netlify Functions
- Security best practices
- Testing strategies

**See: [THERAPIST_PORTAL_TEMPLATE.md](../THERAPIST_PORTAL_TEMPLATE.md)**

## Working API Functions

The actual **active** serverless API functionality is in:
- `/netlify/functions/` - Netlify serverless functions (hello.mts, health.mts)
- `/netlify/edge-functions/` - Netlify edge functions (geo-personalization.ts)

These are configured in `netlify.toml` and work with the current Vite + React deployment platform.
