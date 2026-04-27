/**
 * Creates the SQLite database directly using better-sqlite3,
 * bypassing Prisma's schema engine (which has issues on Node 24 / Windows).
 * Run: npx tsx prisma/create-db.ts
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
console.log(`Creating database at: ${dbPath}`);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
-- Control Plane
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'TRIAL',
  schemaName TEXT,
  settings TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  contractStartDate DATETIME,
  contractEndDate DATETIME,
  planTier TEXT
);

CREATE TABLE IF NOT EXISTS super_admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Core User Models
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  fullName TEXT NOT NULL,
  phoneNumber TEXT,
  phoneVerified INTEGER NOT NULL DEFAULT 0,
  phoneVerifiedAt DATETIME,
  photoUrl TEXT,
  dateOfBirth DATETIME,
  institutionMemberStatus TEXT,
  graduationYear INTEGER,
  program TEXT,
  hashedPassword TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  lastActiveAt DATETIME,
  suspendedUntil DATETIME,
  suspensionReason TEXT,
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);
CREATE INDEX IF NOT EXISTS idx_users_tenantId ON users(tenantId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deletedAt ON users(deletedAt);

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  missionStatement TEXT,
  domainId TEXT,
  currentCity TEXT,
  currentCountry TEXT,
  yearsOfExperienceCached INTEGER,
  profileCompletenessScore INTEGER NOT NULL DEFAULT 0,
  isVisibleInDiscovery INTEGER NOT NULL DEFAULT 1,
  acceptingNewConversations INTEGER NOT NULL DEFAULT 1,
  weeklyInboxLimit INTEGER NOT NULL DEFAULT 10,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (domainId) REFERENCES domains(id)
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_domainId ON user_profiles(domainId);
CREATE INDEX IF NOT EXISTS idx_user_profiles_visible ON user_profiles(isVisibleInDiscovery);

CREATE TABLE IF NOT EXISTS user_niches (
  userId TEXT NOT NULL,
  nicheId TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (userId, nicheId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheId) REFERENCES niches(id)
);
CREATE INDEX IF NOT EXISTS idx_user_niches_nicheId ON user_niches(nicheId);

CREATE TABLE IF NOT EXISTS user_education (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  programName TEXT NOT NULL,
  batchYear INTEGER,
  specialization TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_education_userId ON user_education(userId);

CREATE TABLE IF NOT EXISTS user_experiences (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  companyId TEXT,
  freeTextCompanyName TEXT,
  title TEXT NOT NULL,
  startDate DATETIME,
  endDate DATETIME,
  isCurrent INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'MANUAL',
  verified INTEGER NOT NULL DEFAULT 0,
  verifiedAt DATETIME,
  verifiedByAdminId TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (verifiedByAdminId) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_user_experiences_userId ON user_experiences(userId);
CREATE INDEX IF NOT EXISTS idx_user_experiences_companyId ON user_experiences(companyId);

CREATE TABLE IF NOT EXISTS linkedin_links (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  linkedinUrl TEXT NOT NULL,
  verifiedByAdminId TEXT,
  verifiedAt DATETIME,
  verificationStatus TEXT NOT NULL DEFAULT 'UNVERIFIED',
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verifiedByAdminId) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_linkedin_links_userId ON linkedin_links(userId);

-- Taxonomy
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS niches (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalizedName TEXT NOT NULL UNIQUE,
  logoUrl TEXT,
  category TEXT,
  isActive INTEGER NOT NULL DEFAULT 1
);

-- Badges & Signals
CREATE TABLE IF NOT EXISTS badge_templates (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  displayNameDefault TEXT NOT NULL,
  descriptionDefault TEXT,
  category TEXT NOT NULL,
  verificationRequired INTEGER NOT NULL DEFAULT 0,
  criteriaSchema TEXT,
  visualTreatment TEXT,
  defaultActive INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS signal_templates (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  displayNameDefault TEXT NOT NULL,
  descriptionDefault TEXT,
  icon TEXT,
  signalType TEXT NOT NULL,
  pairedTemplateId TEXT,
  defaultActive INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (pairedTemplateId) REFERENCES signal_templates(id)
);

CREATE TABLE IF NOT EXISTS tenant_badges (
  id TEXT PRIMARY KEY,
  templateId TEXT NOT NULL,
  displayName TEXT,
  description TEXT,
  visualTreatment TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  criteriaOverride TEXT,
  FOREIGN KEY (templateId) REFERENCES badge_templates(id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_badges_templateId ON tenant_badges(templateId);

CREATE TABLE IF NOT EXISTS tenant_signals (
  id TEXT PRIMARY KEY,
  templateId TEXT NOT NULL,
  displayName TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (templateId) REFERENCES signal_templates(id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_signals_templateId ON tenant_signals(templateId);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  tenantBadgeId TEXT NOT NULL,
  awardedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  awardedByAdminId TEXT,
  expiresAt DATETIME,
  verificationRequestId TEXT,
  isVisible INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenantBadgeId) REFERENCES tenant_badges(id),
  FOREIGN KEY (awardedByAdminId) REFERENCES admin_users(id),
  FOREIGN KEY (verificationRequestId) REFERENCES verification_requests(id)
);
CREATE INDEX IF NOT EXISTS idx_user_badges_userId ON user_badges(userId);
CREATE INDEX IF NOT EXISTS idx_user_badges_tenantBadgeId ON user_badges(tenantBadgeId);

CREATE TABLE IF NOT EXISTS user_open_signals (
  userId TEXT NOT NULL,
  tenantSignalId TEXT NOT NULL,
  isOpen INTEGER NOT NULL DEFAULT 1,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, tenantSignalId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenantSignalId) REFERENCES tenant_signals(id)
);

-- Connection Layer
CREATE TABLE IF NOT EXISTS saved_users (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  savedUserId TEXT NOT NULL,
  note TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, savedUserId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (savedUserId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_saved_users_savedUserId ON saved_users(savedUserId);

CREATE TABLE IF NOT EXISTS nudges (
  id TEXT PRIMARY KEY,
  senderUserId TEXT NOT NULL,
  receiverUserId TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'SENT',
  sentAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  respondedAt DATETIME,
  responseMessage TEXT,
  expiresAt DATETIME,
  conversationId TEXT,
  FOREIGN KEY (senderUserId) REFERENCES users(id),
  FOREIGN KEY (receiverUserId) REFERENCES users(id),
  FOREIGN KEY (conversationId) REFERENCES conversations(id)
);
CREATE INDEX IF NOT EXISTS idx_nudges_senderUserId ON nudges(senderUserId);
CREATE INDEX IF NOT EXISTS idx_nudges_receiverUserId ON nudges(receiverUserId);
CREATE INDEX IF NOT EXISTS idx_nudges_status ON nudges(status);

CREATE TABLE IF NOT EXISTS nudge_signals (
  nudgeId TEXT NOT NULL,
  tenantSignalId TEXT NOT NULL,
  PRIMARY KEY (nudgeId, tenantSignalId),
  FOREIGN KEY (nudgeId) REFERENCES nudges(id) ON DELETE CASCADE,
  FOREIGN KEY (tenantSignalId) REFERENCES tenant_signals(id)
);

CREATE TABLE IF NOT EXISTS nudge_relationships (
  senderUserId TEXT NOT NULL,
  receiverUserId TEXT NOT NULL,
  lastNudgedAt DATETIME NOT NULL,
  countLifetime INTEGER NOT NULL DEFAULT 0,
  lastOutcome TEXT,
  cooldownUntil DATETIME,
  PRIMARY KEY (senderUserId, receiverUserId),
  FOREIGN KEY (senderUserId) REFERENCES users(id),
  FOREIGN KEY (receiverUserId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS nudge_quotas (
  userId TEXT NOT NULL,
  weekStartDate DATETIME NOT NULL,
  nudgesSentCount INTEGER NOT NULL DEFAULT 0,
  weeklyLimit INTEGER NOT NULL DEFAULT 5,
  PRIMARY KEY (userId, weekStartDate),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  userAId TEXT NOT NULL,
  userBId TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastMessageAt DATETIME,
  isArchivedByA INTEGER NOT NULL DEFAULT 0,
  isArchivedByB INTEGER NOT NULL DEFAULT 0,
  originatedFromNudgeId TEXT,
  UNIQUE(userAId, userBId),
  FOREIGN KEY (userAId) REFERENCES users(id),
  FOREIGN KEY (userBId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_conversations_userBId ON conversations(userBId);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  senderUserId TEXT NOT NULL,
  body TEXT NOT NULL,
  sentAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  readAtByRecipient DATETIME,
  deletedAt DATETIME,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (senderUserId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_messages_conversationId ON messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_messages_senderUserId ON messages(senderUserId);

CREATE TABLE IF NOT EXISTS mentorships (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL UNIQUE,
  mentorUserId TEXT NOT NULL,
  menteeUserId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROPOSED',
  goal TEXT,
  cadence TEXT,
  proposedByUserId TEXT NOT NULL,
  startedAt DATETIME,
  endedAt DATETIME,
  completionReason TEXT,
  FOREIGN KEY (conversationId) REFERENCES conversations(id),
  FOREIGN KEY (mentorUserId) REFERENCES users(id),
  FOREIGN KEY (menteeUserId) REFERENCES users(id),
  FOREIGN KEY (proposedByUserId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentorUserId ON mentorships(mentorUserId);
CREATE INDEX IF NOT EXISTS idx_mentorships_menteeUserId ON mentorships(menteeUserId);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id TEXT PRIMARY KEY,
  mentorshipId TEXT NOT NULL,
  scheduledFor DATETIME,
  completedAt DATETIME,
  mentorMarkedComplete INTEGER NOT NULL DEFAULT 0,
  menteeMarkedComplete INTEGER NOT NULL DEFAULT 0,
  mentorReflection TEXT,
  menteeReflection TEXT,
  sessionNumber INTEGER NOT NULL,
  FOREIGN KEY (mentorshipId) REFERENCES mentorships(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentorshipId ON mentorship_sessions(mentorshipId);

-- Surveys & Matching
CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  createdByAdminId TEXT,
  theme TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  publishedAt DATETIME,
  closesAt DATETIME,
  targetAudienceFilter TEXT,
  matchingStrategy TEXT,
  matchGroupSizeMin INTEGER NOT NULL DEFAULT 2,
  matchGroupSizeMax INTEGER NOT NULL DEFAULT 4,
  FOREIGN KEY (createdByAdminId) REFERENCES admin_users(id)
);

CREATE TABLE IF NOT EXISTS survey_questions (
  id TEXT PRIMARY KEY,
  surveyId TEXT NOT NULL,
  position INTEGER NOT NULL,
  questionText TEXT NOT NULL,
  questionType TEXT NOT NULL,
  isRequired INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_survey_questions_surveyId ON survey_questions(surveyId);

CREATE TABLE IF NOT EXISTS survey_options (
  id TEXT PRIMARY KEY,
  questionId TEXT NOT NULL,
  position INTEGER NOT NULL,
  optionText TEXT NOT NULL,
  optionValue TEXT,
  FOREIGN KEY (questionId) REFERENCES survey_questions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_survey_options_questionId ON survey_options(questionId);

CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY,
  surveyId TEXT NOT NULL,
  userId TEXT NOT NULL,
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(surveyId, userId),
  FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_survey_responses_userId ON survey_responses(userId);

CREATE TABLE IF NOT EXISTS survey_response_answers (
  id TEXT PRIMARY KEY,
  responseId TEXT NOT NULL,
  questionId TEXT NOT NULL,
  optionId TEXT NOT NULL,
  FOREIGN KEY (responseId) REFERENCES survey_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (questionId) REFERENCES survey_questions(id),
  FOREIGN KEY (optionId) REFERENCES survey_options(id)
);
CREATE INDEX IF NOT EXISTS idx_survey_response_answers_responseId ON survey_response_answers(responseId);
CREATE INDEX IF NOT EXISTS idx_survey_response_answers_questionId ON survey_response_answers(questionId);

CREATE TABLE IF NOT EXISTS match_groups (
  id TEXT PRIMARY KEY,
  surveyId TEXT NOT NULL,
  computedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  matchingSignature TEXT,
  proposedMeetupId TEXT,
  FOREIGN KEY (surveyId) REFERENCES surveys(id)
);
CREATE INDEX IF NOT EXISTS idx_match_groups_surveyId ON match_groups(surveyId);

CREATE TABLE IF NOT EXISTS match_group_members (
  matchGroupId TEXT NOT NULL,
  userId TEXT NOT NULL,
  fitScore REAL,
  notifiedAt DATETIME,
  optedIn INTEGER,
  PRIMARY KEY (matchGroupId, userId),
  FOREIGN KEY (matchGroupId) REFERENCES match_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS meetups (
  id TEXT PRIMARY KEY,
  matchGroupId TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PROPOSED',
  proposedDate DATETIME,
  confirmedDate DATETIME,
  venueId TEXT,
  organizerAdminId TEXT,
  summaryAfter TEXT,
  FOREIGN KEY (matchGroupId) REFERENCES match_groups(id),
  FOREIGN KEY (venueId) REFERENCES venues(id),
  FOREIGN KEY (organizerAdminId) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_meetups_venueId ON meetups(venueId);

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  capacity INTEGER,
  notes TEXT
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'ADMIN_ORGANIZED',
  eventType TEXT,
  startsAt DATETIME NOT NULL,
  endsAt DATETIME,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  venueId TEXT,
  capacity INTEGER,
  rsvpDeadline DATETIME,
  isPublished INTEGER NOT NULL DEFAULT 0,
  createdByAdminId TEXT,
  generatedFromMeetupId TEXT,
  coverImageUrl TEXT,
  FOREIGN KEY (venueId) REFERENCES venues(id),
  FOREIGN KEY (createdByAdminId) REFERENCES admin_users(id),
  FOREIGN KEY (generatedFromMeetupId) REFERENCES meetups(id)
);
CREATE INDEX IF NOT EXISTS idx_events_venueId ON events(venueId);
CREATE INDEX IF NOT EXISTS idx_events_startsAt ON events(startsAt);
CREATE INDEX IF NOT EXISTS idx_events_isPublished ON events(isPublished);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id TEXT PRIMARY KEY,
  eventId TEXT NOT NULL,
  userId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ATTENDING',
  rsvpAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(eventId, userId),
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_userId ON event_rsvps(userId);

CREATE TABLE IF NOT EXISTS event_attendances (
  id TEXT PRIMARY KEY,
  eventId TEXT NOT NULL,
  userId TEXT NOT NULL,
  checkedInAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checkedInBy TEXT,
  UNIQUE(eventId, userId),
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_event_attendances_userId ON event_attendances(userId);

-- Gamification
CREATE TABLE IF NOT EXISTS contribution_events (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  eventType TEXT NOT NULL,
  pointsAwarded INTEGER NOT NULL DEFAULT 0,
  relatedEntityType TEXT,
  relatedEntityId TEXT,
  occurredAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_contribution_events_userId ON contribution_events(userId);
CREATE INDEX IF NOT EXISTS idx_contribution_events_eventType ON contribution_events(eventType);
CREATE INDEX IF NOT EXISTS idx_contribution_events_occurredAt ON contribution_events(occurredAt);

CREATE TABLE IF NOT EXISTS gamification_rules (
  id TEXT PRIMARY KEY,
  eventType TEXT NOT NULL,
  pointsValue INTEGER NOT NULL,
  conditions TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  validFrom DATETIME,
  validUntil DATETIME
);

CREATE TABLE IF NOT EXISTS user_gamification_states (
  userId TEXT PRIMARY KEY,
  totalPoints INTEGER NOT NULL DEFAULT 0,
  currentLevel INTEGER NOT NULL DEFAULT 1,
  levelAchievedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  currentStreakWeeks INTEGER NOT NULL DEFAULT 0,
  longestStreakWeeks INTEGER NOT NULL DEFAULT 0,
  nudgesSentLifetime INTEGER NOT NULL DEFAULT 0,
  nudgesAcceptedLifetime INTEGER NOT NULL DEFAULT 0,
  nudgesReceivedLifetime INTEGER NOT NULL DEFAULT 0,
  nudgesRespondedLifetime INTEGER NOT NULL DEFAULT 0,
  mentorshipsAsMentorCount INTEGER NOT NULL DEFAULT 0,
  mentorshipsAsMenteeCount INTEGER NOT NULL DEFAULT 0,
  eventsAttendedCount INTEGER NOT NULL DEFAULT 0,
  eventsHostedCount INTEGER NOT NULL DEFAULT 0,
  resourcesSharedCount INTEGER NOT NULL DEFAULT 0,
  surveysCompletedCount INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS level_definitions (
  id TEXT PRIMARY KEY,
  levelNumber INTEGER NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  pointsRequired INTEGER NOT NULL,
  unlockPayload TEXT
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  relatedEntityType TEXT,
  relatedEntityId TEXT,
  readAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_readAt ON notifications(readAt);
CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications(createdAt);

CREATE TABLE IF NOT EXISTS notification_preferences (
  userId TEXT PRIMARY KEY,
  emailEnabled INTEGER NOT NULL DEFAULT 1,
  pushEnabled INTEGER NOT NULL DEFAULT 1,
  inAppEnabled INTEGER NOT NULL DEFAULT 1,
  quietHoursStart TEXT,
  quietHoursEnd TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  digestFrequency TEXT NOT NULL DEFAULT 'IMMEDIATE',
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin & Audit
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OPERATOR',
  status TEXT NOT NULL DEFAULT 'INVITED',
  tenantId TEXT,
  invitedBy TEXT,
  invitedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  joinedAt DATETIME,
  suspendedUntil DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (invitedBy) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_admin_users_tenantId ON admin_users(tenantId);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actorUserId TEXT,
  actorAdminId TEXT,
  action TEXT NOT NULL,
  targetType TEXT,
  targetId TEXT,
  payload TEXT,
  occurredAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ipAddress TEXT,
  userAgent TEXT,
  FOREIGN KEY (actorUserId) REFERENCES users(id),
  FOREIGN KEY (actorAdminId) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actorUserId ON audit_logs(actorUserId);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actorAdminId ON audit_logs(actorAdminId);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_occurredAt ON audit_logs(occurredAt);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(targetType, targetId);

CREATE TABLE IF NOT EXISTS verification_requests (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  requestType TEXT NOT NULL,
  payload TEXT,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewedByAdminId TEXT,
  reviewedAt DATETIME,
  adminNotes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (reviewedByAdminId) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_verification_requests_userId ON verification_requests(userId);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

CREATE TABLE IF NOT EXISTS verification_evidence_files (
  id TEXT PRIMARY KEY,
  verificationRequestId TEXT NOT NULL,
  fileStorageKey TEXT NOT NULL,
  fileType TEXT,
  uploadedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  FOREIGN KEY (verificationRequestId) REFERENCES verification_requests(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_verification_evidence_files_requestId ON verification_evidence_files(verificationRequestId);

-- DPDPA
CREATE TABLE IF NOT EXISTS policy_versions (
  id TEXT PRIMARY KEY,
  policyType TEXT NOT NULL,
  versionNumber INTEGER NOT NULL,
  effectiveFrom DATETIME NOT NULL,
  effectiveTo DATETIME,
  contentUrl TEXT NOT NULL,
  summaryOfChanges TEXT,
  UNIQUE(policyType, versionNumber)
);

CREATE TABLE IF NOT EXISTS user_consents (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  consentType TEXT NOT NULL,
  policyVersionId TEXT,
  acceptedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ipAddress TEXT,
  userAgent TEXT,
  withdrawnAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (policyVersionId) REFERENCES policy_versions(id)
);
CREATE INDEX IF NOT EXISTS idx_user_consents_userId ON user_consents(userId);
CREATE INDEX IF NOT EXISTS idx_user_consents_consentType ON user_consents(consentType);

CREATE TABLE IF NOT EXISTS data_subject_requests (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  requestType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dueBy DATETIME,
  completedAt DATETIME,
  responsePayloadUrl TEXT,
  adminHandlerId TEXT,
  rejectionReason TEXT,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (adminHandlerId) REFERENCES admin_users(id)
);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_userId ON data_subject_requests(userId);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);

-- Resource Shelf
CREATE TABLE IF NOT EXISTS resource_categories (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  isActive INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS resource_shelf_items (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  categoryId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  canSharePointer INTEGER NOT NULL DEFAULT 0,
  canRunSession INTEGER NOT NULL DEFAULT 0,
  tags TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES resource_categories(id)
);
CREATE INDEX IF NOT EXISTS idx_resource_shelf_items_userId ON resource_shelf_items(userId);
CREATE INDEX IF NOT EXISTS idx_resource_shelf_items_categoryId ON resource_shelf_items(categoryId);
`);

console.log("Database created successfully with all tables!");
db.close();
