/**
 * User Journals Blob Store
 *
 * Manages therapeutic journals, user documents, and progress notes
 * for grief processing and therapy tracking.
 */

import {
  getBlobStore,
  STORE_NAMES,
  userScopedKey,
  createMetadata,
  type BlobMetadata,
} from "./store";

/**
 * Journal entry interface.
 */
export interface JournalEntry {
  id: string;
  content: string;
  mood?: string;
  tags: string[];
  createdAt: number;
  updatedAt?: number;
}

/**
 * Journal entry metadata interface.
 */
interface JournalEntryMetadata extends BlobMetadata {
  mood?: string;
  tags: string[];
  wordCount: number;
}

/**
 * Mood options for journal entries.
 */
export const MOOD_OPTIONS = {
  REFLECTIVE: "reflective",
  HOPEFUL: "hopeful",
  GRIEVING: "grieving",
  PEACEFUL: "peaceful",
  ANXIOUS: "anxious",
  GRATEFUL: "grateful",
  STRUGGLING: "struggling",
  ACCEPTING: "accepting",
} as const;

export type MoodOption = (typeof MOOD_OPTIONS)[keyof typeof MOOD_OPTIONS];

/**
 * Gets the journals store.
 */
function getJournalStore() {
  return getBlobStore(STORE_NAMES.USER_JOURNALS);
}

/**
 * Creates or updates a journal entry.
 *
 * @param userId - The user's ID
 * @param entryId - Unique entry identifier
 * @param content - The journal entry content
 * @param options - Optional entry details
 * @returns Promise with the entry key
 */
export async function saveJournalEntry(
  userId: string,
  entryId: string,
  content: string,
  options?: {
    mood?: MoodOption;
    tags?: string[];
  }
): Promise<{ key: string }> {
  const store = getJournalStore();
  const key = userScopedKey(userId, `entries/${entryId}`);

  // Check if entry exists for update timestamp
  const existing = await store.getMetadata(key);

  const entry: JournalEntry = {
    id: entryId,
    content,
    mood: options?.mood,
    tags: options?.tags || [],
    createdAt: existing?.metadata?.createdAt || Date.now(),
    updatedAt: existing ? Date.now() : undefined,
  };

  const metadata: JournalEntryMetadata = {
    ...createMetadata(userId),
    mood: options?.mood,
    tags: options?.tags || [],
    wordCount: content.split(/\s+/).filter(Boolean).length,
    ...(existing?.metadata?.createdAt && { createdAt: existing.metadata.createdAt }),
    ...(existing && { updatedAt: Date.now() }),
  };

  await store.setJSON(key, entry, { metadata });

  return { key };
}

/**
 * Retrieves a journal entry.
 *
 * @param userId - The user's ID
 * @param entryId - The entry identifier
 * @returns The journal entry, or null if not found
 */
export async function getJournalEntry(
  userId: string,
  entryId: string
): Promise<JournalEntry | null> {
  const store = getJournalStore();
  const key = userScopedKey(userId, `entries/${entryId}`);

  const entry = await store.get(key, { type: "json" });
  return entry as JournalEntry | null;
}

/**
 * Lists all journal entries for a user.
 *
 * @param userId - The user's ID
 * @returns Array of entry keys
 */
export async function listJournalEntries(
  userId: string
): Promise<Array<{ key: string; etag: string }>> {
  const store = getJournalStore();
  const prefix = userScopedKey(userId, "entries/");

  const { blobs } = await store.list({ prefix });
  return blobs;
}

/**
 * Gets all journal entries for a user with full content.
 *
 * @param userId - The user's ID
 * @returns Array of journal entries
 */
export async function getAllJournalEntries(
  userId: string
): Promise<JournalEntry[]> {
  const store = getJournalStore();
  const entries = await listJournalEntries(userId);
  const results: JournalEntry[] = [];

  for (const { key } of entries) {
    const entry = await store.get(key, { type: "json" });
    if (entry) {
      results.push(entry as JournalEntry);
    }
  }

  // Sort by creation date, newest first
  return results.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Searches journal entries by tag.
 *
 * @param userId - The user's ID
 * @param tag - Tag to search for
 * @returns Matching journal entries
 */
export async function searchByTag(
  userId: string,
  tag: string
): Promise<JournalEntry[]> {
  const entries = await getAllJournalEntries(userId);
  return entries.filter((entry) => entry.tags.includes(tag));
}

/**
 * Searches journal entries by mood.
 *
 * @param userId - The user's ID
 * @param mood - Mood to filter by
 * @returns Matching journal entries
 */
export async function searchByMood(
  userId: string,
  mood: MoodOption
): Promise<JournalEntry[]> {
  const entries = await getAllJournalEntries(userId);
  return entries.filter((entry) => entry.mood === mood);
}

/**
 * Gets journal entry metadata without loading full content.
 *
 * @param userId - The user's ID
 * @param entryId - The entry identifier
 * @returns The entry metadata, or null if not found
 */
export async function getJournalEntryMetadata(
  userId: string,
  entryId: string
): Promise<JournalEntryMetadata | null> {
  const store = getJournalStore();
  const key = userScopedKey(userId, `entries/${entryId}`);

  const result = await store.getMetadata(key);
  return result?.metadata as JournalEntryMetadata | null;
}

/**
 * Deletes a journal entry.
 *
 * @param userId - The user's ID
 * @param entryId - The entry identifier
 */
export async function deleteJournalEntry(
  userId: string,
  entryId: string
): Promise<void> {
  const store = getJournalStore();
  const key = userScopedKey(userId, `entries/${entryId}`);
  await store.delete(key);
}

/**
 * Gets journal statistics for a user.
 *
 * @param userId - The user's ID
 * @returns Statistics about the user's journal entries
 */
export async function getJournalStats(
  userId: string
): Promise<{
  totalEntries: number;
  totalWords: number;
  moodDistribution: Record<string, number>;
  topTags: Array<{ tag: string; count: number }>;
}> {
  const entries = await getAllJournalEntries(userId);

  const moodDistribution: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  let totalWords = 0;

  for (const entry of entries) {
    // Count words
    totalWords += entry.content.split(/\s+/).filter(Boolean).length;

    // Count moods
    if (entry.mood) {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    }

    // Count tags
    for (const tag of entry.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Sort tags by count
  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEntries: entries.length,
    totalWords,
    moodDistribution,
    topTags,
  };
}
