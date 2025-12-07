/**
 * Authentication Configuration for Therapist Portal
 * 
 * This is TEMPLATE CODE demonstrating Better Auth setup with:
 * - Email/password authentication
 * - OAuth (Google, GitHub) social login
 * - PostgreSQL database via Drizzle ORM adapter
 * - OpenTelemetry instrumentation for monitoring auth events
 * 
 * Dependencies required: 
 *   - better-auth, better-auth/adapters/drizzle
 *   - @kubiks/otel-better-auth
 * 
 * Environment variables needed:
 *   - BETTER_AUTH_SECRET: Secret key for session encryption
 *   - BETTER_AUTH_URL: Base URL of your application
 *   - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (optional for OAuth)
 *   - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (optional for OAuth)
 * 
 * See: THERAPIST_PORTAL_TEMPLATE.md for complete setup guide
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { instrumentBetterAuth } from "@kubiks/otel-better-auth";

// Configure Better Auth with PostgreSQL, OAuth, and monitoring
const auth = betterAuth({
  // Database configuration using Drizzle ORM adapter
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema, // Import all table schemas
  }),
  
  // Session security - CRITICAL: Must set BETTER_AUTH_SECRET in production!
  secret: process.env.BETTER_AUTH_SECRET || (() => {
    // Only allow fallback in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('BETTER_AUTH_SECRET environment variable is required in production');
    }
    console.warn('⚠️  WARNING: Using temporary development secret. Set BETTER_AUTH_SECRET in .env for consistency');
    // Use crypto for better randomness even in development
    const crypto = require('crypto');
    return 'dev-only-' + crypto.randomBytes(32).toString('hex');
  })(),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
  },
  
  // Optional: Social login providers (OAuth)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  
  // OpenTelemetry instrumentation for monitoring and tracing
  plugins: [
    instrumentBetterAuth(),
  ],
});

export default auth;
