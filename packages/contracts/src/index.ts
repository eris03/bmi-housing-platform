// Shared status values. Must stay identical to the enums in apps/api/prisma/schema.prisma
// (enforced by apps/api/test/contracts-sync.spec.ts).

export const UserRole = ["CUSTOMER", "SALES", "PROJECT_MANAGER", "ADMIN", "SUPER_ADMIN"] as const;
export const UserStatus = ["ACTIVE", "DISABLED", "PENDING_DELETION"] as const;
export const ProjectStatus = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const MediaType = ["IMAGE", "DOCUMENT", "VIDEO_LINK"] as const;
export const PlotStatus = ["AVAILABLE", "ON_HOLD", "RESERVED", "SOLD", "INACTIVE"] as const;
export const LeadSource = ["ANDROID_APP", "QR_CODE", "META_AD", "WEBSITE", "PHONE", "STAFF_CREATED", "OTHER"] as const;
export const InterestStatus = ["INTERESTED", "NOT_INTERESTED", "MAYBE_LATER"] as const;
export const VisitStatus = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
export const BookingRequestStatus = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"] as const;
export const SyncStatus = ["PENDING", "SYNCED", "RETRY", "FAILED"] as const;
export const ConsentStatus = ["GRANTED", "WITHDRAWN"] as const;
export const NotificationChannel = ["PUSH", "EMAIL", "SMS", "WHATSAPP"] as const;
export const NotificationStatus = ["PENDING", "SENT", "FAILED", "CANCELLED"] as const;
export const IntegrationDirection = ["OUTBOUND", "INBOUND"] as const;

export type UserRole = (typeof UserRole)[number];
export type UserStatus = (typeof UserStatus)[number];
export type ProjectStatus = (typeof ProjectStatus)[number];
export type MediaType = (typeof MediaType)[number];
export type PlotStatus = (typeof PlotStatus)[number];
export type LeadSource = (typeof LeadSource)[number];
export type InterestStatus = (typeof InterestStatus)[number];
export type VisitStatus = (typeof VisitStatus)[number];
export type BookingRequestStatus = (typeof BookingRequestStatus)[number];
export type SyncStatus = (typeof SyncStatus)[number];
export type ConsentStatus = (typeof ConsentStatus)[number];
export type NotificationChannel = (typeof NotificationChannel)[number];
export type NotificationStatus = (typeof NotificationStatus)[number];
export type IntegrationDirection = (typeof IntegrationDirection)[number];

export const ENUMS = {
  UserRole,
  UserStatus,
  ProjectStatus,
  MediaType,
  PlotStatus,
  LeadSource,
  InterestStatus,
  VisitStatus,
  BookingRequestStatus,
  SyncStatus,
  ConsentStatus,
  NotificationChannel,
  NotificationStatus,
  IntegrationDirection,
} as const;

/** Shape returned by GET /api/v1/health/live and /ready. */
export interface HealthResponse {
  status: "ok" | "error";
  checks?: Record<string, { status: "up" | "down"; detail?: string }>;
  version: string;
  time: string;
}
