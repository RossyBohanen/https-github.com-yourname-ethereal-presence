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
  
  // Session security
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key", // CHANGE IN PRODUCTION!
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
