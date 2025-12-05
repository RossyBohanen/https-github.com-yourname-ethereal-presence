/**
 * User Reports Blob Store
 *
 * Manages PDF progress reports and analytics exports
 * for users and therapists.
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
 * Report metadata interface.
 */
interface ReportMetadata extends BlobMetadata {
  reportType: ReportType;
  title: string;
  periodStart?: string;
  periodEnd?: string;
  generatedFor?: string; // therapist ID if applicable
}

/**
 * Report types.
 */
export const REPORT_TYPES = {
  MONTHLY_PROGRESS: "monthly-progress",
  QUARTERLY_REVIEW: "quarterly-review",
  THERAPY_SUMMARY: "therapy-summary",
  SESSION_REPORT: "session-report",
  ANALYTICS_EXPORT: "analytics-export",
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

/**
 * Gets the reports store.
 */
function getReportsStore() {
  return getBlobStore(STORE_NAMES.USER_REPORTS);
}

/**
 * Stores a generated report.
 *
 * @param userId - The user's ID
 * @param reportName - Unique report name/identifier
 * @param reportData - The PDF file data
 * @param options - Report details
 * @returns Promise with the storage key
 */
export async function storeReport(
  userId: string,
  reportName: string,
  reportData: ArrayBuffer | Blob,
  options: {
    reportType: ReportType;
    title: string;
    periodStart?: string;
    periodEnd?: string;
    generatedFor?: string;
    file: { name: string; type: string; size: number };
  }
): Promise<{ key: string }> {
  // Validate the upload (documents)
  const validation = validateUpload(options.file, "documents");
  if (!validation.valid) {
    throw new Error(`Upload validation failed: ${validation.errors.join(", ")}`);
  }

  const store = getReportsStore();
  const key = userScopedKey(userId, `reports/${reportName}`);

  const metadata: ReportMetadata = {
    ...createMetadata(userId, options.file.type),
    reportType: options.reportType,
    title: options.title,
    periodStart: options.periodStart,
    periodEnd: options.periodEnd,
    generatedFor: options.generatedFor,
  };

  await store.set(key, reportData, { metadata });

  return { key };
}

/**
 * Retrieves a report.
 *
 * @param userId - The user's ID
 * @param reportName - The report name/identifier
 * @returns The report data and metadata, or null if not found
 */
export async function getReport(
  userId: string,
  reportName: string
): Promise<{ data: ArrayBuffer; metadata: ReportMetadata } | null> {
  const store = getReportsStore();
  const key = userScopedKey(userId, `reports/${reportName}`);

  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) {
    return null;
  }

  return {
    data: result.data,
    metadata: result.metadata as ReportMetadata,
  };
}

/**
 * Lists all reports for a user.
 *
 * @param userId - The user's ID
 * @returns Array of report keys
 */
export async function listReports(
  userId: string
): Promise<Array<{ key: string; etag: string }>> {
  const store = getReportsStore();
  const prefix = userScopedKey(userId, "reports/");

  const { blobs } = await store.list({ prefix });
  return blobs;
}

/**
 * Gets report metadata without downloading the file.
 *
 * @param userId - The user's ID
 * @param reportName - The report name/identifier
 * @returns The report metadata, or null if not found
 */
export async function getReportMetadata(
  userId: string,
  reportName: string
): Promise<ReportMetadata | null> {
  const store = getReportsStore();
  const key = userScopedKey(userId, `reports/${reportName}`);

  const result = await store.getMetadata(key);
  return result?.metadata as ReportMetadata | null;
}

/**
 * Gets all report metadata for a user.
 *
 * @param userId - The user's ID
 * @returns Array of report metadata
 */
export async function getAllReportMetadata(
  userId: string
): Promise<Array<ReportMetadata & { key: string }>> {
  const store = getReportsStore();
  const reports = await listReports(userId);
  const results: Array<ReportMetadata & { key: string }> = [];

  for (const { key } of reports) {
    const result = await store.getMetadata(key);
    if (result?.metadata) {
      results.push({
        key,
        ...(result.metadata as ReportMetadata),
      });
    }
  }

  // Sort by creation date, newest first
  return results.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Filters reports by type.
 *
 * @param userId - The user's ID
 * @param reportType - The report type to filter by
 * @returns Matching report metadata
 */
export async function getReportsByType(
  userId: string,
  reportType: ReportType
): Promise<Array<ReportMetadata & { key: string }>> {
  const allReports = await getAllReportMetadata(userId);
  return allReports.filter((report) => report.reportType === reportType);
}

/**
 * Filters reports by date range.
 *
 * @param userId - The user's ID
 * @param startDate - Start of date range (ISO string)
 * @param endDate - End of date range (ISO string)
 * @returns Matching report metadata
 */
export async function getReportsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Array<ReportMetadata & { key: string }>> {
  const allReports = await getAllReportMetadata(userId);
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return allReports.filter((report) => {
    return report.createdAt >= start && report.createdAt <= end;
  });
}

/**
 * Deletes a report.
 *
 * @param userId - The user's ID
 * @param reportName - The report name/identifier
 */
export async function deleteReport(
  userId: string,
  reportName: string
): Promise<void> {
  const store = getReportsStore();
  const key = userScopedKey(userId, `reports/${reportName}`);
  await store.delete(key);
}

/**
 * Generates a standardized report filename.
 *
 * @param reportType - The type of report
 * @param periodStart - Period start date
 * @param periodEnd - Period end date
 * @returns A formatted filename
 */
export function generateReportFilename(
  reportType: ReportType,
  periodStart?: string,
  periodEnd?: string
): string {
  const timestamp = new Date().toISOString().slice(0, 10);

  if (periodStart && periodEnd) {
    return `${reportType}_${periodStart}_to_${periodEnd}.pdf`;
  }

  return `${reportType}_${timestamp}.pdf`;
}
