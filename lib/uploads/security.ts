/**
 * File Upload Security Utilities
 *
 * Security best practices for handling file uploads.
 * Use these utilities when implementing file upload features.
 */

/**
 * Allowed MIME types for file uploads.
 * Add or remove types based on your application's requirements.
 */
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  documents: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
  video: ["video/mp4", "video/webm", "video/ogg"],
};

/**
 * Maximum file sizes in bytes.
 */
export const MAX_FILE_SIZES: Record<string, number> = {
  images: 5 * 1024 * 1024,      // 5MB
  documents: 10 * 1024 * 1024,  // 10MB
  audio: 50 * 1024 * 1024,      // 50MB
  video: 100 * 1024 * 1024,     // 100MB
  default: 5 * 1024 * 1024,     // 5MB
};

/**
 * Dangerous file extensions to always reject.
 */
const DANGEROUS_EXTENSIONS = [
  ".exe", ".dll", ".bat", ".cmd", ".sh", ".ps1",
  ".msi", ".jar", ".vbs", ".js", ".jse", ".wsf",
  ".wsh", ".scr", ".pif", ".reg", ".lnk", ".inf",
  ".hta", ".cpl", ".msc", ".chm", ".php", ".asp",
  ".aspx", ".jsp", ".py", ".rb", ".pl",
];

/**
 * Validates file type by checking MIME type and extension.
 */
export function validateFileType(
  file: { name: string; type: string },
  category: keyof typeof ALLOWED_MIME_TYPES
): { valid: boolean; error?: string } {
  const allowedTypes = ALLOWED_MIME_TYPES[category];
  if (!allowedTypes) {
    return { valid: false, error: "Invalid file category" };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  // Check for dangerous extensions
  const lowerName = file.name.toLowerCase();
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      return { valid: false, error: "File extension is not allowed" };
    }
  }

  // Check for double extensions (e.g., file.jpg.exe)
  const parts = file.name.split(".");
  if (parts.length > 2) {
    for (const ext of DANGEROUS_EXTENSIONS) {
      if (parts.some(part => `.${part}` === ext)) {
        return { valid: false, error: "Suspicious file extension detected" };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates file size against limits.
 */
export function validateFileSize(
  size: number,
  category: keyof typeof MAX_FILE_SIZES = "default"
): { valid: boolean; error?: string } {
  const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.default;
  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  return { valid: true };
}

/**
 * Generates a safe filename by sanitizing user input.
 * Removes special characters and limits length.
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  let safe = filename.replace(/[/\\]/g, "");

  // Remove null bytes and control characters
  safe = safe.replace(/[\x00-\x1f\x7f]/g, "");

  // Keep only alphanumeric, dots, hyphens, and underscores
  safe = safe.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  // Remove leading dots (hidden files)
  safe = safe.replace(/^\.+/, "");

  // Limit length (preserve extension)
  const maxLength = 255;
  if (safe.length > maxLength) {
    const ext = safe.slice(safe.lastIndexOf("."));
    const name = safe.slice(0, maxLength - ext.length);
    safe = name + ext;
  }

  // Ensure we have a valid filename
  return safe || "unnamed_file";
}

/**
 * Validates a complete file upload.
 * Combines type, size, and filename validation.
 */
export function validateUpload(
  file: { name: string; type: string; size: number },
  category: keyof typeof ALLOWED_MIME_TYPES
): { valid: boolean; errors: string[]; sanitizedName?: string } {
  const errors: string[] = [];

  const typeResult = validateFileType(file, category);
  if (!typeResult.valid && typeResult.error) {
    errors.push(typeResult.error);
  }

  const sizeResult = validateFileSize(file.size, category);
  if (!sizeResult.valid && sizeResult.error) {
    errors.push(sizeResult.error);
  }

  const sanitizedName = sanitizeFilename(file.name);

  return {
    valid: errors.length === 0,
    errors,
    sanitizedName,
  };
}

/**
 * Security recommendations for file upload implementation:
 *
 * 1. STORAGE:
 *    - Store uploaded files outside the web root
 *    - Use random/UUID filenames instead of user-provided names
 *    - Consider using cloud storage (S3, GCS) with proper IAM policies
 *
 * 2. MALWARE SCANNING:
 *    - Integrate with ClamAV or a cloud-based scanning service
 *    - Quarantine files until scanning completes
 *    - Never serve unscanned files to users
 *
 * 3. CONTENT VALIDATION:
 *    - Verify file contents match declared MIME type (magic bytes)
 *    - For images: re-encode to strip EXIF data and malicious payloads
 *    - For documents: consider sandboxed processing
 *
 * 4. ACCESS CONTROL:
 *    - Implement proper authorization for file access
 *    - Use signed URLs with expiration for sensitive files
 *    - Log all file access for audit purposes
 *
 * 5. RATE LIMITING:
 *    - Limit upload frequency per user/IP
 *    - Implement total storage quotas per user
 *    - Monitor for abuse patterns
 */
