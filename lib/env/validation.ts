/**
 * Environment Variable Validation
 *
 * Validates required environment variables at application startup.
 * Provides clear error messages for missing or invalid configuration.
 */

interface EnvVarConfig {
  name: string;
  required: boolean;
  productionOnly?: boolean;
  validator?: (value: string) => boolean;
  description: string;
}

const ENV_VARS: EnvVarConfig[] = [
  // Database
  {
    name: "DATABASE_URL",
    required: true,
    description: "PostgreSQL connection string",
    validator: (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
  },

  // Authentication
  {
    name: "BETTER_AUTH_SECRET",
    required: true,
    productionOnly: true,
    description: "Secret key for Better Auth session encryption",
    validator: (v) => v.length >= 32,
  },
  {
    name: "BETTER_AUTH_URL",
    required: true,
    productionOnly: true,
    description: "Base URL for authentication callbacks",
    validator: (v) => v.startsWith("https://"),
  },

  // OAuth Providers (optional but recommended)
  {
    name: "GOOGLE_CLIENT_ID",
    required: false,
    description: "Google OAuth client ID",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
    description: "Google OAuth client secret",
  },
  {
    name: "GITHUB_CLIENT_ID",
    required: false,
    description: "GitHub OAuth client ID",
  },
  {
    name: "GITHUB_CLIENT_SECRET",
    required: false,
    description: "GitHub OAuth client secret",
  },

  // Netlify
  {
    name: "NETLIFY_BLOBS_TOKEN",
    required: false,
    description: "Netlify Blobs authentication token (auto-provided in deploy context)",
  },

  // Email
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "Resend API key for transactional emails",
  },

  // Billing
  {
    name: "AUTUMN_SECRET_KEY",
    required: false,
    description: "Autumn billing platform secret key",
  },

  // Queue
  {
    name: "QSTASH_TOKEN",
    required: false,
    description: "Upstash QStash authentication token",
  },
  {
    name: "QSTASH_CURRENT_SIGNING_KEY",
    required: false,
    description: "QStash webhook signature verification key",
  },
  {
    name: "QSTASH_NEXT_SIGNING_KEY",
    required: false,
    description: "QStash next rotation signing key",
  },

  // Observability
  {
    name: "KUBIKS_API_KEY",
    required: false,
    description: "Kubiks OpenTelemetry API key",
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const isProduction = process.env.NODE_ENV === "production";
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];

  for (const config of ENV_VARS) {
    const value = process.env[config.name];

    // Skip production-only checks in development
    if (config.productionOnly && !isProduction) {
      continue;
    }

    // Check if required variable is missing
    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${config.name} - ${config.description}`);
      missing.push(config.name);
      continue;
    }

    // Check if optional variable is missing
    if (!config.required && !value) {
      warnings.push(`Optional environment variable not set: ${config.name} - ${config.description}`);
      continue;
    }

    // Run custom validator if provided
    if (value && config.validator && !config.validator(value)) {
      errors.push(`Invalid value for ${config.name}: ${config.description}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
  };
}

/**
 * Assert environment is valid or throw
 */
export function assertValidEnvironment(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error("Environment validation failed:");
    result.errors.forEach((err) => console.error(`  - ${err}`));

    if (result.warnings.length > 0) {
      console.warn("\nWarnings:");
      result.warnings.forEach((warn) => console.warn(`  - ${warn}`));
    }

    throw new Error(
      `Environment validation failed: ${result.errors.length} error(s). Missing: ${result.missing.join(", ")}`
    );
  }

  // Log warnings in production
  if (process.env.NODE_ENV === "production" && result.warnings.length > 0) {
    console.warn("Environment warnings:");
    result.warnings.forEach((warn) => console.warn(`  - ${warn}`));
  }
}

/**
 * Get environment variable with type safety
 */
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
export function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * Get environment name
 */
export function getEnvironmentName(): string {
  return process.env.NODE_ENV || "development";
}
