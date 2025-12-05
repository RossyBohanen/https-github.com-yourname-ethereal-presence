/**
 * Netlify Blobs Store Utilities
 *
 * Environment-aware blob storage that isolates production data from
 * staging/development environments. Uses global stores for production
 * and deploy-scoped stores for non-production.
 */

import { getStore, getDeployStore, type Store } from "@netlify/blobs";

/**
 * Available blob store names in the application.
 */
export const STORE_NAMES = {
  USER_PROFILES: "user-profiles",
  SESSION_RECORDINGS: "session-recordings",
  THERAPEUTIC_CONTENT: "therapeutic-content",
  USER_JOURNALS: "user-journals",
  USER_REPORTS: "user-reports",
  APP_CONFIG: "app-config",
} as const;

export type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];

/**
 * Store options for blob operations.
 */
interface StoreOptions {
  consistency?: "strong" | "eventual";
}

/**
 * Determines if the current environment is production.
 */
function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Gets an environment-aware blob store.
 *
 * In production: Uses global-scoped stores (getStore) for persistent data
 * In non-production: Uses deploy-scoped stores (getDeployStore) to isolate test data
 *
 * @param name - The store name
 * @param options - Optional store configuration
 * @returns A Store instance
 */
export function getBlobStore(name: StoreName, options?: StoreOptions): Store {
  if (isProductionEnvironment()) {
    return options?.consistency
      ? getStore({ name, consistency: options.consistency })
      : getStore(name);
  }

  // Non-production: use deploy-scoped store
  return getDeployStore(name);
}

/**
 * Gets a store with strong consistency.
 * Use for operations requiring immediate visibility of updates.
 *
 * @param name - The store name
 * @returns A Store instance with strong consistency
 */
export function getStrongConsistencyStore(name: StoreName): Store {
  return getBlobStore(name, { consistency: "strong" });
}

/**
 * Creates a namespaced key with user scope for user-specific data.
 *
 * @param userId - The authenticated user's ID
 * @param key - The key within the user's namespace
 * @returns A namespaced key string
 */
export function userScopedKey(userId: string, key: string): string {
  if (!userId || !key) {
    throw new Error("userId and key are required for user-scoped keys");
  }
  return `${userId}/${key}`;
}

/**
 * Standard metadata for blob entries.
 */
export interface BlobMetadata {
  createdAt: number;
  updatedAt?: number;
  createdBy?: string;
  contentType?: string;
  [key: string]: unknown;
}

/**
 * Creates standard metadata for a new blob entry.
 *
 * @param userId - Optional user ID who created the entry
 * @param contentType - Optional MIME type of the content
 * @returns Metadata object with timestamps
 */
export function createMetadata(
  userId?: string,
  contentType?: string
): BlobMetadata {
  return {
    createdAt: Date.now(),
    ...(userId && { createdBy: userId }),
    ...(contentType && { contentType }),
  };
}

/**
 * Updates metadata with a new timestamp.
 *
 * @param existing - Existing metadata object
 * @returns Updated metadata with new updatedAt timestamp
 */
export function updateMetadata(existing: BlobMetadata): BlobMetadata {
  return {
    ...existing,
    updatedAt: Date.now(),
  };
}

export { type Store } from "@netlify/blobs";
