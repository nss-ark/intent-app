import { db } from "@/lib/db";

export const AuditActions = {
  // Auth
  USER_LOGIN: "USER_LOGIN",
  USER_SIGNUP: "USER_SIGNUP",
  USER_LOGOUT: "USER_LOGOUT",

  // Profile
  PROFILE_UPDATED: "PROFILE_UPDATED",
  PROFILE_VIEWED: "PROFILE_VIEWED",
  SIGNALS_UPDATED: "SIGNALS_UPDATED",
  EXPERIENCE_ADDED: "EXPERIENCE_ADDED",
  EXPERIENCE_UPDATED: "EXPERIENCE_UPDATED",
  EXPERIENCE_DELETED: "EXPERIENCE_DELETED",

  // Nudges
  NUDGE_SENT: "NUDGE_SENT",
  NUDGE_ACCEPTED: "NUDGE_ACCEPTED",
  NUDGE_DECLINED: "NUDGE_DECLINED",
  NUDGE_IGNORED: "NUDGE_IGNORED",

  // Chat
  MESSAGE_SENT: "MESSAGE_SENT",
  CONVERSATION_ARCHIVED: "CONVERSATION_ARCHIVED",

  // Surveys
  SURVEY_RESPONSE_SUBMITTED: "SURVEY_RESPONSE_SUBMITTED",

  // Consent / DPDPA
  CONSENT_GRANTED: "CONSENT_GRANTED",
  CONSENT_WITHDRAWN: "CONSENT_WITHDRAWN",
  DATA_EXPORT_REQUESTED: "DATA_EXPORT_REQUESTED",
  DATA_ERASURE_REQUESTED: "DATA_ERASURE_REQUESTED",

  // Admin
  ADMIN_VERIFICATION_REVIEWED: "ADMIN_VERIFICATION_REVIEWED",
  ADMIN_MEMBER_IMPORTED: "ADMIN_MEMBER_IMPORTED",
  ADMIN_SURVEY_CREATED: "ADMIN_SURVEY_CREATED",
  ADMIN_EVENT_CREATED: "ADMIN_EVENT_CREATED",
  ADMIN_BADGE_AWARDED: "ADMIN_BADGE_AWARDED",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

interface AuditParams {
  actorUserId?: string;
  actorAdminId?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Fire-and-forget audit log writer.
 * Does not block the calling route handler.
 */
export function logAudit(params: AuditParams) {
  db.auditLog
    .create({
      data: {
        actorUserId: params.actorUserId ?? null,
        actorAdminId: params.actorAdminId ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        payload: params.payload ? JSON.stringify(params.payload) : null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    })
    .catch((err) => {
      console.error("[audit] Failed to write audit log:", err);
    });
}

/** Extract IP and user-agent from a Request for audit logging */
export function requestMeta(request: Request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown",
    userAgent: request.headers.get("user-agent") ?? "unknown",
  };
}
