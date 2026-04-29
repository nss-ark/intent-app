/**
 * Intent core TypeScript types.
 *
 * These mirror the data model in master-plan-intent.md.
 * All primary keys are UUIDs (strings). All timestamps are ISO 8601 strings
 * at the TypeScript boundary (Date objects in Prisma, serialized for API).
 */

// ── Utility types ───────────────────────────────────────────────────────

/** UUID string alias for clarity */
export type UUID = string;

/** ISO 8601 timestamp string */
export type ISODateTime = string;

/** ISO date string (YYYY-MM-DD) */
export type ISODate = string;

/** Time string (HH:mm) */
export type TimeString = string;

/** Soft-deletable entity */
export interface SoftDeletable {
  deletedAt: ISODateTime | null;
}

/** Auditable entity with timestamps */
export interface Timestamped {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// ── User & Profile ──────────────────────────────────────────────────────

export type InstitutionMemberStatus =
  | "current_student"
  | "recent_grad"
  | "alumni";

export type UserType = "STUDENT" | "ALUMNI";

export interface User extends Timestamped, SoftDeletable {
  id: UUID;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: ISODateTime | null;
  photoUrl: string | null;
  dateOfBirth: ISODate | null;
  institutionMemberStatus: InstitutionMemberStatus;
  userType: UserType;
  graduationYear: number | null;
  program: string | null;
  lastActiveAt: ISODateTime | null;
  suspendedUntil: ISODateTime | null;
  suspensionReason: string | null;
}

export interface UserProfile {
  id: UUID;
  userId: UUID;
  /** The Intent: 200-character mission statement */
  missionStatement: string;
  domainId: UUID | null;
  currentCity: string | null;
  currentCountry: string | null;
  cityChangedAt: ISODateTime | null;
  yearsOfExperienceCached: number | null;
  profileCompletenessScore: number;
  isVisibleInDiscovery: boolean;
  acceptingNewConversations: boolean;
  weeklyInboxLimit: number;
  updatedAt: ISODateTime;
}

/** User joined with their profile for display purposes */
export interface UserWithProfile extends User {
  profile: UserProfile | null;
  domain: Domain | null;
  niches: Niche[];
  openSignals: UserOpenSignal[];
  badges: UserBadge[];
  currentExperience: UserExperience | null;
}

/** Compact card representation for the discovery feed */
export interface UserCard {
  id: UUID;
  fullName: string;
  photoUrl: string | null;
  missionStatement: string;
  institutionMemberStatus: InstitutionMemberStatus;
  yearsOfExperience: number | null;
  currentCity: string | null;
  currentCountry: string | null;
  domain: Pick<Domain, "id" | "displayName"> | null;
  niches: Pick<Niche, "id" | "displayName">[];
  currentCompany: string | null;
  companyLogoUrl: string | null;
  openSignals: Pick<TenantSignal, "id" | "displayName" | "signalType" | "icon">[];
  badges: Pick<UserBadge, "id" | "tenantBadgeId" | "displayName" | "isVisible">[];
  isVerified: boolean;
}

// ── Education & Experience ──────────────────────────────────────────────

export interface UserEducation {
  id: UUID;
  userId: UUID;
  programName: string;
  batchYear: number;
  specialization: string | null;
  verified: boolean;
}

export type ExperienceSource = "manual" | "admin_imported";

export interface UserExperience {
  id: UUID;
  userId: UUID;
  companyId: UUID | null;
  freeTextCompanyName: string | null;
  title: string;
  startDate: ISODate;
  endDate: ISODate | null;
  isCurrent: boolean;
  source: ExperienceSource;
  verified: boolean;
  verifiedAt: ISODateTime | null;
  verifiedByAdminId: UUID | null;
}

export interface LinkedInLink {
  id: UUID;
  userId: UUID;
  linkedinUrl: string;
  verifiedByAdminId: UUID | null;
  verifiedAt: ISODateTime | null;
  verificationStatus: "unverified" | "verified" | "mismatch";
}

// ── Taxonomy ────────────────────────────────────────────────────────────

export interface Domain {
  id: UUID;
  code: string;
  displayName: string;
  description: string | null;
  position: number;
  isActive: boolean;
}

export interface Niche {
  id: UUID;
  code: string;
  displayName: string;
  description: string | null;
  position: number;
  isActive: boolean;
}

export interface UserNiche {
  userId: UUID;
  nicheId: UUID;
  /** Position 1, 2, or 3 */
  position: number;
}

export interface Company {
  id: UUID;
  name: string;
  normalizedName: string;
  logoUrl: string | null;
  category: string | null;
  isActive: boolean;
}

// ── Signals (Asks, Offers, Mutuals) ─────────────────────────────────────

export type SignalType = "ask" | "offer" | "mutual";

/** Global signal template (control plane) */
export interface SignalTemplate {
  id: UUID;
  code: string;
  displayNameDefault: string;
  descriptionDefault: string | null;
  icon: string | null;
  signalType: SignalType;
  pairedTemplateId: UUID | null;
  defaultActive: boolean;
}

/** Tenant-specific signal instance */
export interface TenantSignal {
  id: UUID;
  templateId: UUID;
  displayName: string;
  signalType: SignalType;
  icon: string | null;
  isActive: boolean;
}

/** Per-user active signals */
export interface UserOpenSignal {
  userId: UUID;
  tenantSignalId: UUID;
  isOpen: boolean;
  updatedAt: ISODateTime;
  /** Populated when joined with TenantSignal */
  signal?: TenantSignal;
}

// ── Badges ──────────────────────────────────────────────────────────────

export type BadgeCategory = "identity" | "achievement" | "special";

/** Global badge template (control plane) */
export interface BadgeTemplate {
  id: UUID;
  code: string;
  displayNameDefault: string;
  descriptionDefault: string | null;
  category: BadgeCategory;
  verificationRequired: boolean;
  criteriaSchema: Record<string, unknown> | null;
  visualTreatment: Record<string, unknown> | null;
  defaultActive: boolean;
}

/** Tenant-specific badge instance */
export interface TenantBadge {
  id: UUID;
  templateId: UUID;
  displayName: string;
  description: string | null;
  visualTreatment: Record<string, unknown> | null;
  isActive: boolean;
  criteriaOverride: Record<string, unknown> | null;
}

/** A badge awarded to a user */
export interface UserBadge {
  id: UUID;
  userId: UUID;
  tenantBadgeId: UUID;
  /** Display name from the TenantBadge (joined) */
  displayName?: string;
  awardedAt: ISODateTime;
  awardedByAdminId: UUID | null;
  expiresAt: ISODateTime | null;
  verificationRequestId: UUID | null;
  isVisible: boolean;
}

// ── Verification ────────────────────────────────────────────────────────

export type VerificationStatus =
  | "submitted"
  | "in_review"
  | "info_requested"
  | "approved"
  | "rejected";

export interface VerificationRequest {
  id: UUID;
  userId: UUID;
  requestType: string;
  payload: Record<string, unknown>;
  status: VerificationStatus;
  submittedAt: ISODateTime;
  reviewedByAdminId: UUID | null;
  reviewedAt: ISODateTime | null;
  adminNotes: string | null;
  version: number;
}

export interface VerificationEvidenceFile {
  id: UUID;
  verificationRequestId: UUID;
  fileStorageKey: string;
  fileType: string;
  uploadedAt: ISODateTime;
  deletedAt: ISODateTime | null;
}

// ── Nudge ───────────────────────────────────────────────────────────────

export type NudgeStatus =
  | "sent"
  | "accepted"
  | "declined"
  | "ignored"
  | "expired";

export interface Nudge {
  id: UUID;
  senderUserId: UUID;
  receiverUserId: UUID;
  message: string;
  status: NudgeStatus;
  sentAt: ISODateTime;
  respondedAt: ISODateTime | null;
  responseMessage: string | null;
  expiresAt: ISODateTime;
  conversationId: UUID | null;
  /** Populated when joined */
  signals?: TenantSignal[];
  sender?: UserCard;
  receiver?: UserCard;
}

export interface NudgeSignal {
  nudgeId: UUID;
  tenantSignalId: UUID;
}

export interface NudgeRelationship {
  senderUserId: UUID;
  receiverUserId: UUID;
  lastNudgedAt: ISODateTime;
  countLifetime: number;
  lastOutcome: NudgeStatus;
  cooldownUntil: ISODateTime | null;
}

export interface NudgeQuota {
  userId: UUID;
  weekStartDate: ISODate;
  nudgesSentCount: number;
  weeklyLimit: number;
}

// ── Conversations & Messages ────────────────────────────────────────────

export interface Conversation {
  id: UUID;
  userAId: UUID;
  userBId: UUID;
  createdAt: ISODateTime;
  lastMessageAt: ISODateTime | null;
  isArchivedByA: boolean;
  isArchivedByB: boolean;
  originatedFromNudgeId: UUID | null;
  matchId: UUID | null;
  /** Populated when joined */
  otherUser?: UserCard;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: UUID;
  conversationId: UUID;
  senderUserId: UUID;
  body: string;
  sentAt: ISODateTime;
  readAtByRecipient: ISODateTime | null;
  deletedAt: ISODateTime | null;
}

// ── Mentorship ──────────────────────────────────────────────────────────

export type MentorshipStatus =
  | "proposed"
  | "active"
  | "paused"
  | "completed"
  | "declined";

export type MentorshipCadence = "every_2_weeks" | "monthly" | "ad_hoc";

export interface Mentorship {
  id: UUID;
  conversationId: UUID;
  mentorUserId: UUID;
  menteeUserId: UUID;
  status: MentorshipStatus;
  goal: string | null;
  cadence: MentorshipCadence;
  proposedByUserId: UUID;
  matchId: UUID | null;
  startedAt: ISODateTime | null;
  endedAt: ISODateTime | null;
  completionReason: string | null;
}

export interface MentorshipSession {
  id: UUID;
  mentorshipId: UUID;
  scheduledFor: ISODateTime;
  completedAt: ISODateTime | null;
  mentorMarkedComplete: boolean;
  menteeMarkedComplete: boolean;
  mentorReflection: string | null;
  menteeReflection: string | null;
  sessionNumber: number;
}

// ── Surveys & Matching ──────────────────────────────────────────────────

export type SurveyStatus = "draft" | "published" | "closed" | "archived";

export type MatchingStrategy = "overlap" | "complementarity";

export type SurveyQuestionType = "single_select" | "multi_select";

export interface Survey {
  id: UUID;
  title: string;
  description: string | null;
  createdByAdminId: UUID;
  theme: string | null;
  status: SurveyStatus;
  publishedAt: ISODateTime | null;
  closesAt: ISODateTime | null;
  targetAudienceFilter: Record<string, unknown> | null;
  matchingStrategy: MatchingStrategy;
  matchGroupSizeMin: number;
  matchGroupSizeMax: number;
}

export interface SurveyQuestion {
  id: UUID;
  surveyId: UUID;
  position: number;
  questionText: string;
  questionType: SurveyQuestionType;
  isRequired: boolean;
  /** Populated when joined */
  options?: SurveyOption[];
}

export interface SurveyOption {
  id: UUID;
  questionId: UUID;
  position: number;
  optionText: string;
  optionValue: string;
}

export interface SurveyResponse {
  id: UUID;
  surveyId: UUID;
  userId: UUID;
  submittedAt: ISODateTime;
  answers?: SurveyResponseAnswer[];
}

export interface SurveyResponseAnswer {
  id: UUID;
  responseId: UUID;
  questionId: UUID;
  optionId: UUID;
}

export interface MatchGroup {
  id: UUID;
  surveyId: UUID;
  computedAt: ISODateTime;
  matchingSignature: Record<string, unknown> | null;
  proposedMeetupId: UUID | null;
  /** Populated when joined */
  members?: MatchGroupMember[];
}

export interface MatchGroupMember {
  matchGroupId: UUID;
  userId: UUID;
  fitScore: number;
  notifiedAt: ISODateTime | null;
  optedIn: boolean;
  /** Populated when joined */
  user?: UserCard;
}

// ── Meetups & Venues ────────────────────────────────────────────────────

export type MeetupStatus = "proposed" | "scheduled" | "completed" | "cancelled";

export interface Meetup {
  id: UUID;
  matchGroupId: UUID;
  status: MeetupStatus;
  proposedDate: ISODate | null;
  confirmedDate: ISODate | null;
  venueId: UUID | null;
  organizerAdminId: UUID | null;
  summaryAfter: string | null;
}

export interface Venue {
  id: UUID;
  name: string;
  address: string | null;
  city: string | null;
  capacity: number | null;
  notes: string | null;
}

// ── Events ──────────────────────────────────────────────────────────────

export type EventSource = "ADMIN_CREATED" | "USER_CREATED" | "SYSTEM_GENERATED";

export type EventVisibility = "PUBLIC" | "PRIVATE";

export type EventType = "PANEL" | "WORKSHOP" | "REUNION" | "DINNER" | "TALK" | "MEETUP" | "OTHER";

export interface Event {
  id: UUID;
  title: string;
  description: string | null;
  source: EventSource;
  eventType: EventType | null;
  startsAt: ISODateTime;
  endsAt: ISODateTime | null;
  timezone: string;
  venueId: UUID | null;
  capacity: number | null;
  rsvpDeadline: ISODateTime | null;
  isPublished: boolean;
  visibility: EventVisibility;
  createdByAdminId: UUID | null;
  createdByUserId: UUID | null;
  generatedFromMeetupId: UUID | null;
  coverImageUrl: string | null;
  location: string | null;
  /** Populated when joined */
  venue?: Venue;
  rsvpCount?: number;
  userRsvpStatus?: EventRsvpStatus | null;
  creator?: UserCard;
  niches?: Niche[];
}

export type EventRsvpStatus = "attending" | "waitlisted" | "declined";

export interface EventRsvp {
  id: UUID;
  eventId: UUID;
  userId: UUID;
  status: EventRsvpStatus;
  rsvpAt: ISODateTime;
}

export interface EventAttendance {
  id: UUID;
  eventId: UUID;
  userId: UUID;
  checkedInAt: ISODateTime;
  checkedInBy: string;
}

// ── Feed / Posts ────────────────────────────────────────────────────────

export type FeedType = "CAMPUS" | "NETWORK";

export type PostStatus = "ACTIVE" | "ARCHIVED" | "REMOVED";

export type PostReportReason = "SPAM" | "HARASSMENT" | "INAPPROPRIATE" | "MISINFORMATION" | "OTHER";

export type PostReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

export interface Post {
  id: UUID;
  authorId: UUID;
  feedType: FeedType;
  body: string;
  status: PostStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  archivedAt: ISODateTime | null;
  removedAt: ISODateTime | null;
  /** Populated when joined */
  author?: UserCard;
  replyCount?: number;
  replies?: PostReply[];
}

export interface PostReply {
  id: UUID;
  postId: UUID;
  authorId: UUID;
  body: string;
  status: PostStatus;
  createdAt: ISODateTime;
  /** Populated when joined */
  author?: UserCard;
}

export interface PostReport {
  id: UUID;
  reporterId: UUID;
  postId: UUID | null;
  replyId: UUID | null;
  reason: PostReportReason;
  description: string | null;
  status: PostReportStatus;
  createdAt: ISODateTime;
}

// ── Matching System ────────────────────────────────────────────────────

export type MatchType = "ONE_TO_ONE" | "MENTORSHIP";

export type MatchStatus = "PENDING" | "NOTIFIED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type MatchUserStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export interface Match {
  id: UUID;
  matchType: MatchType;
  userAId: UUID;
  userBId: UUID;
  status: MatchStatus;
  userAStatus: MatchUserStatus;
  userBStatus: MatchUserStatus;
  matchScore: number | null;
  matchReason: string | null;
  matchingRunId: UUID | null;
  notifiedAt: ISODateTime | null;
  acceptedAt: ISODateTime | null;
  createdAt: ISODateTime;
  /** Populated when joined */
  otherUser?: UserCard;
  sharedNiches?: Niche[];
  sharedSignals?: TenantSignal[];
}

export interface GroupMatchItem {
  id: UUID;
  status: MatchStatus;
  matchScore: number | null;
  matchReason: string | null;
  groupSize: number;
  createdAt: ISODateTime;
  activatedAt: ISODateTime | null;
  /** Populated when joined */
  members?: GroupMatchMemberItem[];
  niches?: Niche[];
  groupConversationId?: UUID | null;
}

export interface GroupMatchMemberItem {
  groupMatchId: UUID;
  userId: UUID;
  status: MatchUserStatus;
  fitScore: number | null;
  /** Populated when joined */
  user?: UserCard;
}

export interface MatchingConfigItem {
  id: UUID;
  tenantId: UUID | null;
  matchType: string;
  isEnabled: boolean;
  frequency: string;
  nextRunAt: ISODateTime | null;
  lastRunAt: ISODateTime | null;
  minMatchScore: number;
  groupSizeMin: number;
  groupSizeMax: number;
  acceptanceWindowHours: number;
  matchesPerUserPerRun: number;
}

// ── Group Conversations ────────────────────────────────────────────────

export interface GroupConversationItem {
  id: UUID;
  name: string | null;
  groupMatchId: UUID | null;
  nicheId: UUID | null;
  createdAt: ISODateTime;
  lastMessageAt: ISODateTime | null;
  /** Populated when joined */
  memberCount?: number;
  unreadCount?: number;
  lastMessage?: GroupMessageItem;
}

export interface GroupMessageItem {
  id: UUID;
  groupConversationId: UUID;
  senderUserId: UUID;
  body: string;
  sentAt: ISODateTime;
  /** Populated when joined */
  sender?: UserCard;
}

// ── Event Extensions ───────────────────────────────────────────────────

export interface EventInviteItem {
  id: UUID;
  eventId: UUID;
  inviterId: UUID;
  inviteeId: UUID;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  sentAt: ISODateTime;
  respondedAt: ISODateTime | null;
  /** Populated when joined */
  event?: Event;
  inviter?: UserCard;
}

// ── Gamification ────────────────────────────────────────────────────────

export interface ContributionEvent {
  id: UUID;
  userId: UUID;
  eventType: string;
  pointsAwarded: number;
  relatedEntityType: string | null;
  relatedEntityId: UUID | null;
  occurredAt: ISODateTime;
}

export interface GamificationRule {
  id: UUID;
  eventType: string;
  pointsValue: number;
  conditions: Record<string, unknown> | null;
  isActive: boolean;
  validFrom: ISODateTime;
  validUntil: ISODateTime | null;
}

export interface UserGamificationState {
  userId: UUID;
  totalPoints: number;
  currentLevel: number;
  levelAchievedAt: ISODateTime | null;
  currentStreakWeeks: number;
  longestStreakWeeks: number;
  nudgesSentLifetime: number;
  nudgesAcceptedLifetime: number;
  nudgesReceivedLifetime: number;
  nudgesRespondedLifetime: number;
  mentorshipsAsMentorCount: number;
  mentorshipsAsMenteeCount: number;
  eventsAttendedCount: number;
  eventsHostedCount: number;
  resourcesSharedCount: number;
  surveysCompletedCount: number;
}

export interface LevelDefinition {
  id: UUID;
  levelNumber: number;
  displayName: string;
  pointsRequired: number;
  unlockPayload: Record<string, unknown> | null;
}

export interface RecognitionBadgeHistory {
  id: UUID;
  userId: UUID;
  badgeTemplateCode: string;
  periodStart: ISODate;
  periodEnd: ISODate;
  awardedAt: ISODateTime;
}

// ── Notifications ───────────────────────────────────────────────────────

export type NotificationChannel = "email" | "push" | "in_app";

export type NotificationDispatchStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "failed"
  | "suppressed_by_preferences";

export type DigestFrequency = "immediate" | "daily" | "weekly";

export interface Notification {
  id: UUID;
  userId: UUID;
  type: string;
  title: string;
  body: string;
  relatedEntityType: string | null;
  relatedEntityId: UUID | null;
  channelsDispatched: NotificationChannel[];
  readAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface NotificationDispatch {
  id: UUID;
  notificationId: UUID;
  channel: NotificationChannel;
  status: NotificationDispatchStatus;
  providerMessageId: string | null;
  errorPayload: Record<string, unknown> | null;
  sentAt: ISODateTime | null;
}

export interface PushToken {
  id: UUID;
  userId: UUID;
  token: string;
  platform: "web_push" | "ios" | "android";
  deviceLabel: string | null;
  createdAt: ISODateTime;
  lastUsedAt: ISODateTime | null;
  revokedAt: ISODateTime | null;
}

export interface NotificationPreference {
  userId: UUID;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursStart: TimeString | null;
  quietHoursEnd: TimeString | null;
  timezone: string | null;
  signalFilters: { muteSignals?: string[] } | null;
  eventFilters: Record<string, unknown> | null;
  digestFrequency: DigestFrequency;
}

// ── Admin ───────────────────────────────────────────────────────────────

export type AdminRole = "owner" | "operator" | "moderator";

export type AdminStatus = "active" | "invited" | "suspended";

export interface AdminUser {
  id: UUID;
  userId: UUID | null;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  invitedBy: UUID | null;
  invitedAt: ISODateTime | null;
  joinedAt: ISODateTime | null;
  suspendedUntil: ISODateTime | null;
}

// ── Audit ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: UUID;
  actorUserId: UUID | null;
  actorAdminId: UUID | null;
  action: string;
  targetType: string | null;
  targetId: UUID | null;
  payload: Record<string, unknown> | null;
  occurredAt: ISODateTime;
  ipAddress: string | null;
  userAgent: string | null;
}

// ── Control Plane ───────────────────────────────────────────────────────

export type TenantStatus = "active" | "suspended" | "trial";

export interface Tenant {
  id: UUID;
  slug: string;
  displayName: string;
  status: TenantStatus;
  createdAt: ISODateTime;
  contractStartDate: ISODate | null;
  contractEndDate: ISODate | null;
  planTier: string | null;
  settings: Record<string, unknown> | null;
  schemaName: string;
}

export interface TenantUserDirectory {
  id: UUID;
  email: string;
  hashedPassword: string | null;
  tenantId: UUID;
  tenantUserId: UUID;
  createdAt: ISODateTime;
  lastLoginAt: ISODateTime | null;
}

export type SuperAdminRole = "super_admin" | "support" | "finance" | "read_only";

export interface SuperAdmin {
  id: UUID;
  email: string;
  name: string;
  hashedPassword: string | null;
  role: SuperAdminRole;
  lastLoginAt: ISODateTime | null;
  createdAt: ISODateTime;
}

// ── DPDPA / Consent ─────────────────────────────────────────────────────

export type PolicyType =
  | "terms_of_service"
  | "privacy_policy"
  | "cookie_policy";

export interface PolicyVersion {
  id: UUID;
  policyType: PolicyType;
  versionNumber: string;
  effectiveFrom: ISODateTime;
  effectiveTo: ISODateTime | null;
  contentUrl: string;
  summaryOfChanges: string | null;
}

export interface UserConsent {
  id: UUID;
  userId: UUID;
  policyVersionId: UUID;
  consentedAt: ISODateTime;
  revokedAt: ISODateTime | null;
  ipAddress: string | null;
  userAgent: string | null;
}

// ── API response wrappers ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
