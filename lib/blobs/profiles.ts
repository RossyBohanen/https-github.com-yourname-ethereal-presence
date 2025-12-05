/**
 * User Profiles Blob Store
 *
 * Handles storage and retrieval of user profile assets,
 * primarily profile images/avatars.
 */

import {
  getBlobStore,
  STORE_NAMES,
  userScopedKey,
  createMetadata,
  type BlobMetadata,
} from "./store";
import { validateUpload } from "../uploads/security";

/**
 * Profile image metadata interface.
 */
interface ProfileImageMetadata extends BlobMetadata {
  contentType: string;
  filename: string;
  size: number;
}

/**
 * Gets the user profiles store.
 */
function getProfileStore() {
  return getBlobStore(STORE_NAMES.USER_PROFILES);
}

/**
 * Stores a user's profile image.
 *
 * @param userId - The user's ID
 * @param imageData - The image file data (ArrayBuffer or Blob)
 * @param file - File information for validation
 * @returns Promise resolving on success
 * @throws Error if validation fails
 */
export async function storeProfileImage(
  userId: string,
  imageData: ArrayBuffer | Blob,
  file: { name: string; type: string; size: number }
): Promise<{ key: string }> {
  // Validate the upload using existing security utilities
  const validation = validateUpload(file, "images");
  if (!validation.valid) {
    throw new Error(`Upload validation failed: ${validation.errors.join(", ")}`);
  }

  const store = getProfileStore();
  const key = userScopedKey(userId, "avatar");

  const metadata: ProfileImageMetadata = {
    ...createMetadata(userId, file.type),
    contentType: file.type,
    filename: validation.sanitizedName || file.name,
    size: file.size,
  };

  await store.set(key, imageData, { metadata });

  return { key };
}

/**
 * Retrieves a user's profile image.
 *
 * @param userId - The user's ID
 * @returns The image data as an ArrayBuffer, or null if not found
 */
export async function getProfileImage(
  userId: string
): Promise<{ data: ArrayBuffer; metadata: ProfileImageMetadata } | null> {
  const store = getProfileStore();
  const key = userScopedKey(userId, "avatar");

  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) {
    return null;
  }

  return {
    data: result.data,
    metadata: result.metadata as ProfileImageMetadata,
  };
}

/**
 * Deletes a user's profile image.
 *
 * @param userId - The user's ID
 */
export async function deleteProfileImage(userId: string): Promise<void> {
  const store = getProfileStore();
  const key = userScopedKey(userId, "avatar");
  await store.delete(key);
}

/**
 * Checks if a user has a profile image.
 *
 * @param userId - The user's ID
 * @returns True if the user has a profile image
 */
export async function hasProfileImage(userId: string): Promise<boolean> {
  const store = getProfileStore();
  const key = userScopedKey(userId, "avatar");
  const metadata = await store.getMetadata(key);
  return metadata !== null;
}
