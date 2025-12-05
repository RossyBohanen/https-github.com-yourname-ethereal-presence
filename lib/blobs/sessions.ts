/**
 * Session Recordings Blob Store
 *
 * Handles storage and retrieval of VR therapy session recordings
 * for therapist review and user reflection.
 */

import {
  getStrongConsistencyStore,
  STORE_NAMES,
  userScopedKey,
  createMetadata,
  type BlobMetadata,
} from "./store";
import { validateUpload } from "../uploads/security";

/**
 * Session recording metadata interface.
 */
interface SessionRecordingMetadata extends BlobMetadata {
  sessionId: string;
  duration: number; // seconds
  sessionType: string;
  therapistId?: string;
  notes?: string;
}

/**
 * Session types for therapeutic sessions.
 */
export const SESSION_TYPES = {
  GRIEF_PROCESSING: "grief-processing",
  EXPOSURE_THERAPY: "exposure-therapy",
  MEMORY_WORK: "memory-work",
  GUIDED_MEDITATION: "guided-meditation",
} as const;

export type SessionType = (typeof SESSION_TYPES)[keyof typeof SESSION_TYPES];

/**
 * Gets the session recordings store with strong consistency.
 * Strong consistency ensures recordings are immediately available after upload.
 */
function getSessionStore() {
  return getStrongConsistencyStore(STORE_NAMES.SESSION_RECORDINGS);
}

/**
 * Stores a session recording.
 *
 * @param userId - The user's ID
 * @param sessionId - Unique session identifier
 * @param recordingData - The recording file data
 * @param options - Session details
 * @returns Promise with the storage key
 */
export async function storeSessionRecording(
  userId: string,
  sessionId: string,
  recordingData: ArrayBuffer | Blob,
  options: {
    duration: number;
    sessionType: SessionType;
    therapistId?: string;
    file: { name: string; type: string; size: number };
  }
): Promise<{ key: string }> {
  // Validate the upload
  const validation = validateUpload(options.file, "video");
  if (!validation.valid) {
    throw new Error(`Upload validation failed: ${validation.errors.join(", ")}`);
  }

  const store = getSessionStore();
  const key = userScopedKey(userId, `sessions/${sessionId}`);

  const metadata: SessionRecordingMetadata = {
    ...createMetadata(userId, options.file.type),
    sessionId,
    duration: options.duration,
    sessionType: options.sessionType,
    ...(options.therapistId && { therapistId: options.therapistId }),
  };

  await store.set(key, recordingData, { metadata });

  return { key };
}

/**
 * Retrieves a session recording.
 *
 * @param userId - The user's ID
 * @param sessionId - The session identifier
 * @returns The recording data and metadata, or null if not found
 */
export async function getSessionRecording(
  userId: string,
  sessionId: string
): Promise<{ data: ArrayBuffer; metadata: SessionRecordingMetadata } | null> {
  const store = getSessionStore();
  const key = userScopedKey(userId, `sessions/${sessionId}`);

  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) {
    return null;
  }

  return {
    data: result.data,
    metadata: result.metadata as SessionRecordingMetadata,
  };
}

/**
 * Lists all session recordings for a user.
 *
 * @param userId - The user's ID
 * @returns Array of session keys with their metadata
 */
export async function listUserSessions(
  userId: string
): Promise<Array<{ key: string; etag: string }>> {
  const store = getSessionStore();
  const prefix = userScopedKey(userId, "sessions/");

  const { blobs } = await store.list({ prefix });
  return blobs;
}

/**
 * Gets metadata for a session recording without downloading the data.
 *
 * @param userId - The user's ID
 * @param sessionId - The session identifier
 * @returns The session metadata, or null if not found
 */
export async function getSessionMetadata(
  userId: string,
  sessionId: string
): Promise<SessionRecordingMetadata | null> {
  const store = getSessionStore();
  const key = userScopedKey(userId, `sessions/${sessionId}`);

  const result = await store.getMetadata(key);
  if (!result) {
    return null;
  }

  return result.metadata as SessionRecordingMetadata;
}

/**
 * Adds notes to an existing session recording.
 *
 * @param userId - The user's ID
 * @param sessionId - The session identifier
 * @param notes - Notes to add
 */
export async function addSessionNotes(
  userId: string,
  sessionId: string,
  notes: string
): Promise<void> {
  const store = getSessionStore();
  const key = userScopedKey(userId, `sessions/${sessionId}`);

  // Get existing recording
  const existing = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!existing) {
    throw new Error("Session recording not found");
  }

  // Update metadata with notes
  const updatedMetadata: SessionRecordingMetadata = {
    ...(existing.metadata as SessionRecordingMetadata),
    notes,
    updatedAt: Date.now(),
  };

  // Re-store with updated metadata
  await store.set(key, existing.data, { metadata: updatedMetadata });
}

/**
 * Deletes a session recording.
 *
 * @param userId - The user's ID
 * @param sessionId - The session identifier
 */
export async function deleteSessionRecording(
  userId: string,
  sessionId: string
): Promise<void> {
  const store = getSessionStore();
  const key = userScopedKey(userId, `sessions/${sessionId}`);
  await store.delete(key);
}
