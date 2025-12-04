/**
 * App Configuration Blob Store
 *
 * Manages feature flags and dynamic configuration
 * that can be updated without redeploying.
 */

import {
  getStrongConsistencyStore,
  STORE_NAMES,
  type BlobMetadata,
} from "./store";

/**
 * Feature flags configuration interface.
 */
export interface FeatureFlags {
  // UI Features
  newExposureTherapyUI: boolean;
  multilanguageEnabled: boolean;
  darkModeEnabled: boolean;
  betaFeaturesEnabled: boolean;

  // Therapy Features
  vrSessionsEnabled: boolean;
  groupTherapyEnabled: boolean;
  aiGuidedMeditation: boolean;

  // Limits
  maxSessionDuration: number; // seconds
  maxJournalEntryLength: number; // characters
  maxStoragePerUser: number; // bytes

  // Experimental
  experimentalFeatures: string[];
}

/**
 * Configuration metadata interface.
 */
interface ConfigMetadata extends BlobMetadata {
  version: string;
  environment: string;
  lastUpdatedBy?: string;
}

/**
 * Default feature flags.
 */
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  newExposureTherapyUI: false,
  multilanguageEnabled: true,
  darkModeEnabled: true,
  betaFeaturesEnabled: false,

  vrSessionsEnabled: true,
  groupTherapyEnabled: false,
  aiGuidedMeditation: false,

  maxSessionDuration: 3600, // 1 hour
  maxJournalEntryLength: 50000, // ~10,000 words
  maxStoragePerUser: 5 * 1024 * 1024 * 1024, // 5GB

  experimentalFeatures: [],
};

/**
 * Gets the config store with strong consistency.
 * Strong consistency ensures config changes are immediately visible.
 */
function getConfigStore() {
  return getStrongConsistencyStore(STORE_NAMES.APP_CONFIG);
}

/**
 * Gets current feature flags.
 *
 * @param version - Optional version string (defaults to "v1")
 * @returns Current feature flags, or defaults if not configured
 */
export async function getFeatureFlags(
  version: string = "v1"
): Promise<FeatureFlags> {
  const store = getConfigStore();
  const key = `features/${version}`;

  const flags = await store.get(key, { type: "json" });

  if (!flags) {
    return { ...DEFAULT_FEATURE_FLAGS };
  }

  // Merge with defaults to ensure all flags exist
  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...(flags as Partial<FeatureFlags>),
  };
}

/**
 * Updates feature flags.
 *
 * @param updates - Partial feature flags to update
 * @param options - Update options
 * @returns The updated feature flags
 */
export async function updateFeatureFlags(
  updates: Partial<FeatureFlags>,
  options?: {
    version?: string;
    updatedBy?: string;
  }
): Promise<FeatureFlags> {
  const store = getConfigStore();
  const version = options?.version || "v1";
  const key = `features/${version}`;

  // Get current flags
  const current = await getFeatureFlags(version);

  // Merge updates
  const updated: FeatureFlags = {
    ...current,
    ...updates,
  };

  const metadata: ConfigMetadata = {
    createdAt: Date.now(),
    version,
    environment: process.env.NODE_ENV || "development",
    lastUpdatedBy: options?.updatedBy,
  };

  await store.setJSON(key, updated, { metadata });

  return updated;
}

/**
 * Checks if a specific feature is enabled.
 *
 * @param feature - The feature flag name
 * @returns True if the feature is enabled
 */
export async function isFeatureEnabled(
  feature: keyof Omit<
    FeatureFlags,
    "maxSessionDuration" | "maxJournalEntryLength" | "maxStoragePerUser" | "experimentalFeatures"
  >
): Promise<boolean> {
  const flags = await getFeatureFlags();
  return Boolean(flags[feature]);
}

/**
 * Gets a feature limit value.
 *
 * @param limit - The limit name
 * @returns The limit value
 */
export async function getFeatureLimit(
  limit: "maxSessionDuration" | "maxJournalEntryLength" | "maxStoragePerUser"
): Promise<number> {
  const flags = await getFeatureFlags();
  return flags[limit];
}

/**
 * Checks if an experimental feature is enabled.
 *
 * @param featureName - The experimental feature name
 * @returns True if the experimental feature is enabled
 */
export async function isExperimentalFeatureEnabled(
  featureName: string
): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags.experimentalFeatures.includes(featureName);
}

/**
 * A/B testing configuration interface.
 */
export interface ABTestConfig {
  id: string;
  name: string;
  enabled: boolean;
  variants: Array<{
    id: string;
    name: string;
    weight: number; // percentage
  }>;
  startDate?: string;
  endDate?: string;
}

/**
 * Gets all A/B tests.
 *
 * @returns Array of A/B test configurations
 */
export async function getABTests(): Promise<ABTestConfig[]> {
  const store = getConfigStore();
  const result = await store.get("ab-tests", { type: "json" });
  return (result as ABTestConfig[]) || [];
}

/**
 * Gets a specific A/B test by ID.
 *
 * @param testId - The test identifier
 * @returns The A/B test config, or null if not found
 */
export async function getABTest(testId: string): Promise<ABTestConfig | null> {
  const tests = await getABTests();
  return tests.find((test) => test.id === testId) || null;
}

/**
 * Creates or updates an A/B test.
 *
 * @param test - The A/B test configuration
 */
export async function saveABTest(test: ABTestConfig): Promise<void> {
  const store = getConfigStore();
  const tests = await getABTests();

  const existingIndex = tests.findIndex((t) => t.id === test.id);
  if (existingIndex >= 0) {
    tests[existingIndex] = test;
  } else {
    tests.push(test);
  }

  await store.setJSON("ab-tests", tests);
}

/**
 * Deletes an A/B test.
 *
 * @param testId - The test identifier
 */
export async function deleteABTest(testId: string): Promise<void> {
  const store = getConfigStore();
  const tests = await getABTests();
  const filtered = tests.filter((test) => test.id !== testId);
  await store.setJSON("ab-tests", filtered);
}

/**
 * Assigns a user to an A/B test variant based on weights.
 *
 * @param test - The A/B test configuration
 * @param userId - The user's ID (used for consistent assignment)
 * @returns The assigned variant ID, or null if test is disabled
 */
export function assignVariant(
  test: ABTestConfig,
  userId: string
): string | null {
  if (!test.enabled) {
    return null;
  }

  // Check date range if specified
  const now = new Date();
  if (test.startDate && new Date(test.startDate) > now) {
    return null;
  }
  if (test.endDate && new Date(test.endDate) < now) {
    return null;
  }

  // Generate consistent hash from userId + testId
  const hash = simpleHash(`${userId}:${test.id}`);
  const percentage = hash % 100;

  // Assign based on weights
  let cumulative = 0;
  for (const variant of test.variants) {
    cumulative += variant.weight;
    if (percentage < cumulative) {
      return variant.id;
    }
  }

  // Fallback to first variant
  return test.variants[0]?.id || null;
}

/**
 * Simple hash function for consistent variant assignment.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
