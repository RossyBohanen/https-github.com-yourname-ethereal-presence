/**
 * Netlify Blobs - Storage Layer
 *
 * Unified blob storage for the Grief VR therapeutic platform.
 * Provides environment-aware storage that isolates production
 * data from staging/development environments.
 *
 * ## Store Architecture
 *
 * ```
 * Global Stores (Production):
 * ├── user-profiles/          - User avatars and profile images
 * │   └── {userId}/avatar
 * ├── session-recordings/     - VR therapy session recordings
 * │   └── {userId}/sessions/{sessionId}
 * ├── therapeutic-content/    - Meditations, audio, therapy materials
 * │   ├── catalog/{category}
 * │   └── content/{contentId}
 * ├── user-journals/          - Therapeutic journals and notes
 * │   └── {userId}/entries/{entryId}
 * ├── user-reports/           - Generated PDF reports
 * │   └── {userId}/reports/{reportName}
 * └── app-config/             - Feature flags and configuration
 *     ├── features/{version}
 *     └── ab-tests
 *
 * Deploy-Scoped Stores (Non-Production):
 * └── Same structure as above, but isolated per deploy
 * ```
 *
 * ## Usage Examples
 *
 * ```typescript
 * // Store a profile image
 * import { profiles } from "@/lib/blobs";
 * await profiles.storeProfileImage(userId, imageData, file);
 *
 * // Save a journal entry
 * import { journals } from "@/lib/blobs";
 * await journals.saveJournalEntry(userId, entryId, content, { mood: "reflective" });
 *
 * // Check feature flag
 * import { config } from "@/lib/blobs";
 * const isEnabled = await config.isFeatureEnabled("vrSessionsEnabled");
 * ```
 */

// Core store utilities
export * from "./store";

// Domain-specific stores
export * as profiles from "./profiles";
export * as sessions from "./sessions";
export * as content from "./content";
export * as journals from "./journals";
export * as reports from "./reports";
export * as config from "./config";

// Re-export commonly used types
export type { Store, BlobMetadata } from "./store";
export type { JournalEntry, MoodOption } from "./journals";
export type { SessionType } from "./sessions";
export type { ContentCategory } from "./content";
export type { ReportType } from "./reports";
export type { FeatureFlags, ABTestConfig } from "./config";
