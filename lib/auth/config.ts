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

// Node.js built-ins
import { randomBytes } from 'crypto';

// Third-party packages
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { instrumentBetterAuth } from "@kubiks/otel-better-auth";

// Local imports
import db from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

// Consistent development secret (regenerated only on first use)
let devSecret: string | null = null;

/**
 * Get authentication secret with production safety checks
 * @returns Secret key for session encryption
 * @throws Error if BETTER_AUTH_SECRET is missing in production
 */
function getAuthSecret(): string {
  if (process.env.BETTER_AUTH_SECRET) {
    return process.env.BETTER_AUTH_SECRET;
  }
  
  // Only allow fallback in development
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET environment variable is required in production');
  }
  
  // Generate a consistent secret for the dev session to avoid session invalidation
  if (!devSecret) {
    console.warn('⚠️  WARNING: Using temporary development secret. Set BETTER_AUTH_SECRET in .env for persistence across restarts');
    devSecret = 'dev-only-' + randomBytes(32).toString('hex');
  }
  
  return devSecret;
}

// Configure Better Auth with PostgreSQL, OAuth, and monitoring
const auth = betterAuth({
  // Database configuration using Drizzle ORM adapter
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema, // Import all table schemas
  }),
  
  // Session security - CRITICAL: Must set BETTER_AUTH_SECRET in production!
  secret: getAuthSecret(),
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
