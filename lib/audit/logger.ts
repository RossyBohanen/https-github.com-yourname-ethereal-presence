/**
 * Audit Logging System
 *
 * Provides structured audit logging for security-sensitive events.
 * Designed for HIPAA-adjacent compliance in therapeutic applications.
 */

import {
  getBlobStore,
  STORE_NAMES,
  createMetadata,
} from "../blobs/store";

/**
 * Audit event types
 */
export const AUDIT_EVENTS = {
  // Authentication events
  AUTH_LOGIN_SUCCESS: "auth.login.success",
  AUTH_LOGIN_FAILURE: "auth.login.failure",
  AUTH_LOGOUT: "auth.logout",
  AUTH_PASSWORD_RESET_REQUEST: "auth.password_reset.request",
  AUTH_PASSWORD_RESET_COMPLETE: "auth.password_reset.complete",
  AUTH_REGISTER: "auth.register",

  // Session events
  SESSION_CREATE: "session.create",
  SESSION_DELETE: "session.delete",
  SESSION_VIEW: "session.view",
  SESSION_UPDATE: "session.update",

  // Subscription events
  SUBSCRIPTION_CREATE: "subscription.create",
  SUBSCRIPTION_UPGRADE: "subscription.upgrade",
  SUBSCRIPTION_DOWNGRADE: "subscription.downgrade",
  SUBSCRIPTION_CANCEL: "subscription.cancel",

  // Data events
  DATA_EXPORT_REQUEST: "data.export.request",
  DATA_EXPORT_COMPLETE: "data.export.complete",
  DATA_DELETE_REQUEST: "data.delete.request",
  DATA_DELETE_COMPLETE: "data.delete.complete",

  // Content events
  CONTENT_ACCESS: "content.access",
  CONTENT_DOWNLOAD: "content.download",

  // Security events
  SECURITY_RATE_LIMIT_EXCEEDED: "security.rate_limit.exceeded",
  SECURITY_INVALID_TOKEN: "security.invalid_token",
  SECURITY_SUSPICIOUS_ACTIVITY: "security.suspicious_activity",
} as const;

export type AuditEventType = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS];

/**
 * Audit log entry structure
 */
interface AuditLogEntry {
  id: string;
  timestamp: number;
  event: AuditEventType;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  outcome: "success" | "failure";
  metadata?: Record<string, unknown>;
  // For HIPAA-adjacent compliance, we mask PII in logs
  maskedEmail?: string;
}

/**
 * Mask email for privacy compliance
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";
  const maskedLocal = local.slice(0, 2) + "***";
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask IP address for privacy
 */
function maskIp(ip: string): string {
  if (ip.includes(".")) {
    // IPv4: mask last octet
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  } else if (ip.includes(":")) {
    // IPv6: mask last segments
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":***:***:***:***";
  }
  return "***";
}

/**
 * Generate unique audit log ID
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Get the audit log store
 */
function getAuditStore() {
  // Use app-config store for audit logs
  return getBlobStore(STORE_NAMES.APP_CONFIG);
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  event: AuditEventType,
  options: {
    userId?: string;
    email?: string;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
    resource?: string;
    action?: string;
    outcome: "success" | "failure";
    metadata?: Record<string, unknown>;
  }
): Promise<string> {
  const entry: AuditLogEntry = {
    id: generateAuditId(),
    timestamp: Date.now(),
    event,
    userId: options.userId,
    sessionId: options.sessionId,
    ip: options.ip ? maskIp(options.ip) : undefined,
    userAgent: options.userAgent?.slice(0, 200), // Truncate long user agents
    resource: options.resource,
    action: options.action,
    outcome: options.outcome,
    metadata: options.metadata,
    maskedEmail: options.email ? maskEmail(options.email) : undefined,
  };

  const store = getAuditStore();

  // Store with date-based key for efficient querying
  const date = new Date();
  const dateKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  const key = `audit/${dateKey}/${entry.id}`;

  await store.setJSON(key, entry);

  // Also log to console for immediate observability
  console.log(
    JSON.stringify({
      type: "audit",
      ...entry,
    })
  );

  return entry.id;
}

/**
 * Query audit logs for a user
 */
export async function getAuditLogsForUser(
  userId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: AuditEventType[];
    limit?: number;
  }
): Promise<AuditLogEntry[]> {
  const store = getAuditStore();
  const limit = options?.limit || 100;

  // Generate date range for query
  const endDate = options?.endDate || new Date();
  const startDate = options?.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

  const logs: AuditLogEntry[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate && logs.length < limit) {
    const dateKey = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(currentDate.getDate()).padStart(2, "0")}`;
    const prefix = `audit/${dateKey}/`;

    try {
      const { blobs } = await store.list({ prefix });

      for (const blob of blobs) {
        if (logs.length >= limit) break;

        const entry = (await store.get(blob.key, { type: "json" })) as AuditLogEntry;
        if (entry && entry.userId === userId) {
          if (options?.eventTypes && !options.eventTypes.includes(entry.event)) {
            continue;
          }
          logs.push(entry);
        }
      }
    } catch {
      // Date has no logs, continue
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by timestamp descending (most recent first)
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Query security events (for monitoring)
 */
export async function getSecurityEvents(
  options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<AuditLogEntry[]> {
  const securityEventTypes: AuditEventType[] = [
    AUDIT_EVENTS.AUTH_LOGIN_FAILURE,
    AUDIT_EVENTS.SECURITY_RATE_LIMIT_EXCEEDED,
    AUDIT_EVENTS.SECURITY_INVALID_TOKEN,
    AUDIT_EVENTS.SECURITY_SUSPICIOUS_ACTIVITY,
  ];

  const store = getAuditStore();
  const limit = options?.limit || 100;
  const endDate = options?.endDate || new Date();
  const startDate = options?.startDate || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Default 7 days

  const logs: AuditLogEntry[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate && logs.length < limit) {
    const dateKey = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(currentDate.getDate()).padStart(2, "0")}`;
    const prefix = `audit/${dateKey}/`;

    try {
      const { blobs } = await store.list({ prefix });

      for (const blob of blobs) {
        if (logs.length >= limit) break;

        const entry = (await store.get(blob.key, { type: "json" })) as AuditLogEntry;
        if (entry && securityEventTypes.includes(entry.event)) {
          logs.push(entry);
        }
      }
    } catch {
      // Date has no logs, continue
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Helper to log authentication events
 */
export const auditAuth = {
  loginSuccess: (userId: string, email: string, ip?: string, userAgent?: string) =>
    logAuditEvent(AUDIT_EVENTS.AUTH_LOGIN_SUCCESS, {
      userId,
      email,
      ip,
      userAgent,
      outcome: "success",
    }),

  loginFailure: (email: string, ip?: string, userAgent?: string, reason?: string) =>
    logAuditEvent(AUDIT_EVENTS.AUTH_LOGIN_FAILURE, {
      email,
      ip,
      userAgent,
      outcome: "failure",
      metadata: { reason },
    }),

  logout: (userId: string) =>
    logAuditEvent(AUDIT_EVENTS.AUTH_LOGOUT, {
      userId,
      outcome: "success",
    }),

  register: (userId: string, email: string, ip?: string) =>
    logAuditEvent(AUDIT_EVENTS.AUTH_REGISTER, {
      userId,
      email,
      ip,
      outcome: "success",
    }),
};

/**
 * Helper to log session events
 */
export const auditSession = {
  create: (userId: string, sessionId: string) =>
    logAuditEvent(AUDIT_EVENTS.SESSION_CREATE, {
      userId,
      sessionId,
      resource: `session/${sessionId}`,
      outcome: "success",
    }),

  delete: (userId: string, sessionId: string) =>
    logAuditEvent(AUDIT_EVENTS.SESSION_DELETE, {
      userId,
      sessionId,
      resource: `session/${sessionId}`,
      outcome: "success",
    }),

  view: (userId: string, sessionId: string) =>
    logAuditEvent(AUDIT_EVENTS.SESSION_VIEW, {
      userId,
      sessionId,
      resource: `session/${sessionId}`,
      outcome: "success",
    }),
};

/**
 * Helper to log security events
 */
export const auditSecurity = {
  rateLimitExceeded: (ip: string, endpoint: string) =>
    logAuditEvent(AUDIT_EVENTS.SECURITY_RATE_LIMIT_EXCEEDED, {
      ip,
      resource: endpoint,
      outcome: "failure",
    }),

  invalidToken: (ip?: string, userAgent?: string) =>
    logAuditEvent(AUDIT_EVENTS.SECURITY_INVALID_TOKEN, {
      ip,
      userAgent,
      outcome: "failure",
    }),

  suspiciousActivity: (userId: string | undefined, ip: string, details: Record<string, unknown>) =>
    logAuditEvent(AUDIT_EVENTS.SECURITY_SUSPICIOUS_ACTIVITY, {
      userId,
      ip,
      outcome: "failure",
      metadata: details,
    }),
};
