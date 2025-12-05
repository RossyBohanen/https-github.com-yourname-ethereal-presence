/**
 * Therapeutic Content Blob Store
 *
 * Manages therapeutic media content like guided meditations,
 * audio tracks, and exposure therapy materials that can be
 * assigned to users.
 */

import {
  getBlobStore,
  STORE_NAMES,
  createMetadata,
  type BlobMetadata,
} from "./store";
import { validateUpload } from "../uploads/security";

/**
 * Content item metadata interface.
 */
interface ContentItemMetadata extends BlobMetadata {
  title: string;
  description?: string;
  duration: number; // seconds
  category: ContentCategory;
  language: string;
  tags: string[];
}

/**
 * Content categories for therapeutic materials.
 */
export const CONTENT_CATEGORIES = {
  MEDITATION: "meditation",
  BREATHING: "breathing",
  EXPOSURE_THERAPY: "exposure-therapy",
  MUSIC_THERAPY: "music-therapy",
  GUIDED_IMAGERY: "guided-imagery",
  RELAXATION: "relaxation",
} as const;

export type ContentCategory =
  (typeof CONTENT_CATEGORIES)[keyof typeof CONTENT_CATEGORIES];

/**
 * Catalog entry for content indexing.
 */
interface CatalogEntry {
  key: string;
  title: string;
  description?: string;
  duration: number;
  category: ContentCategory;
  language: string;
  tags: string[];
  addedAt: number;
}

/**
 * Content catalog structure.
 */
interface ContentCatalog {
  items: CatalogEntry[];
  lastUpdated: number;
}

/**
 * Gets the therapeutic content store.
 */
function getContentStore() {
  return getBlobStore(STORE_NAMES.THERAPEUTIC_CONTENT);
}

/**
 * Stores therapeutic content and updates the catalog.
 *
 * @param contentId - Unique content identifier
 * @param contentData - The media file data
 * @param options - Content details
 * @returns Promise with the storage key
 */
export async function storeTherapeuticContent(
  contentId: string,
  contentData: ArrayBuffer | Blob,
  options: {
    title: string;
    description?: string;
    duration: number;
    category: ContentCategory;
    language?: string;
    tags?: string[];
    file: { name: string; type: string; size: number };
    uploadedBy?: string;
  }
): Promise<{ key: string }> {
  // Validate the upload (audio content)
  const validation = validateUpload(options.file, "audio");
  if (!validation.valid) {
    throw new Error(`Upload validation failed: ${validation.errors.join(", ")}`);
  }

  const store = getContentStore();
  const key = `content/${contentId}`;

  const metadata: ContentItemMetadata = {
    ...createMetadata(options.uploadedBy, options.file.type),
    title: options.title,
    description: options.description,
    duration: options.duration,
    category: options.category,
    language: options.language || "en",
    tags: options.tags || [],
  };

  // Store the content
  await store.set(key, contentData, { metadata });

  // Update the category catalog
  await updateCatalog(options.category, {
    key,
    title: options.title,
    description: options.description,
    duration: options.duration,
    category: options.category,
    language: options.language || "en",
    tags: options.tags || [],
    addedAt: Date.now(),
  });

  return { key };
}

/**
 * Updates a content category catalog.
 */
async function updateCatalog(
  category: ContentCategory,
  entry: CatalogEntry
): Promise<void> {
  const store = getContentStore();
  const catalogKey = `catalog/${category}`;

  // Get existing catalog or create new
  const existing = await store.get(catalogKey, { type: "json" });
  const catalog: ContentCatalog = existing || { items: [], lastUpdated: 0 };

  // Add or update entry
  const existingIndex = catalog.items.findIndex((item) => item.key === entry.key);
  if (existingIndex >= 0) {
    catalog.items[existingIndex] = entry;
  } else {
    catalog.items.push(entry);
  }

  catalog.lastUpdated = Date.now();

  await store.setJSON(catalogKey, catalog);
}

/**
 * Retrieves therapeutic content.
 *
 * @param contentId - The content identifier
 * @returns The content data and metadata, or null if not found
 */
export async function getTherapeuticContent(
  contentId: string
): Promise<{ data: ArrayBuffer; metadata: ContentItemMetadata } | null> {
  const store = getContentStore();
  const key = `content/${contentId}`;

  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) {
    return null;
  }

  return {
    data: result.data,
    metadata: result.metadata as ContentItemMetadata,
  };
}

/**
 * Gets the catalog for a content category.
 *
 * @param category - The content category
 * @returns The catalog entries, or empty array if none
 */
export async function getCatalog(
  category: ContentCategory
): Promise<CatalogEntry[]> {
  const store = getContentStore();
  const catalogKey = `catalog/${category}`;

  const catalog = (await store.get(catalogKey, {
    type: "json",
  })) as ContentCatalog | null;

  return catalog?.items || [];
}

/**
 * Gets all catalogs for all categories.
 *
 * @returns Map of category to catalog entries
 */
export async function getAllCatalogs(): Promise<
  Record<ContentCategory, CatalogEntry[]>
> {
  const categories = Object.values(CONTENT_CATEGORIES);
  const result = {} as Record<ContentCategory, CatalogEntry[]>;

  for (const category of categories) {
    result[category] = await getCatalog(category);
  }

  return result;
}

/**
 * Searches content by tags.
 *
 * @param tags - Tags to search for
 * @returns Matching catalog entries
 */
export async function searchByTags(tags: string[]): Promise<CatalogEntry[]> {
  const allCatalogs = await getAllCatalogs();
  const results: CatalogEntry[] = [];

  for (const entries of Object.values(allCatalogs)) {
    for (const entry of entries) {
      if (tags.some((tag) => entry.tags.includes(tag))) {
        results.push(entry);
      }
    }
  }

  return results;
}

/**
 * Searches content by language.
 *
 * @param language - Language code (e.g., "en", "es")
 * @returns Matching catalog entries
 */
export async function searchByLanguage(
  language: string
): Promise<CatalogEntry[]> {
  const allCatalogs = await getAllCatalogs();
  const results: CatalogEntry[] = [];

  for (const entries of Object.values(allCatalogs)) {
    for (const entry of entries) {
      if (entry.language === language) {
        results.push(entry);
      }
    }
  }

  return results;
}

/**
 * Deletes therapeutic content and removes from catalog.
 *
 * @param contentId - The content identifier
 * @param category - The content category
 */
export async function deleteTherapeuticContent(
  contentId: string,
  category: ContentCategory
): Promise<void> {
  const store = getContentStore();
  const key = `content/${contentId}`;

  // Delete the content
  await store.delete(key);

  // Update catalog to remove entry
  const catalogKey = `catalog/${category}`;
  const catalog = (await store.get(catalogKey, {
    type: "json",
  })) as ContentCatalog | null;

  if (catalog) {
    catalog.items = catalog.items.filter((item) => item.key !== key);
    catalog.lastUpdated = Date.now();
    await store.setJSON(catalogKey, catalog);
  }
}
