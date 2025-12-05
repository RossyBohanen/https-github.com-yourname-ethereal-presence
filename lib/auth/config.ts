import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { instrumentBetterAuth } from "@kubiks/otel-better-auth";

// Validate required environment variables in production
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required in production");
}

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
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
  // Secure session cookie configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  advanced: {
    // Use secure cookies in production
    useSecureCookies: isProduction,
    // Set SameSite attribute for CSRF protection
    cookiePrefix: "grief_vr",
  },
  plugins: [
    instrumentBetterAuth(),
  ],
});

export default auth;
