import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString: url });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await hash("password123", 12);

  // ─── Tenant ──────────────────────────────────────────────────────────
  const tenant = await db.tenant.create({
    data: { id: uuid(), slug: "isb", displayName: "ISB", status: "ACTIVE" },
  });
  console.log("  Created tenant: ISB");

  // ─── Domains ─────────────────────────────────────────────────────────
  const domainData = [
    { code: "strategy_consulting", displayName: "Strategy & Consulting" },
    { code: "finance", displayName: "Finance" },
    { code: "tech_product", displayName: "Tech / Product" },
    { code: "vc_pe", displayName: "VC / PE" },
    { code: "climate", displayName: "Climate" },
    { code: "public_policy", displayName: "Public Policy" },
    { code: "healthcare", displayName: "Healthcare" },
    { code: "social_impact", displayName: "Social Impact" },
  ];
  const domains: Record<string, string> = {};
  for (let i = 0; i < domainData.length; i++) {
    const d = await db.domain.create({
      data: { id: uuid(), code: domainData[i].code, displayName: domainData[i].displayName, position: i + 1 },
    });
    domains[d.code] = d.id;
  }
  console.log(`  Created ${domainData.length} domains`);

  // ─── Niches ──────────────────────────────────────────────────────────
  const nicheData = [
    { code: "ai_ml", displayName: "AI/ML" },
    { code: "fintech", displayName: "Fintech" },
    { code: "climate", displayName: "Climate" },
    { code: "healthtech", displayName: "Healthtech" },
    { code: "edtech", displayName: "Edtech" },
    { code: "public_policy", displayName: "Public Policy" },
    { code: "operating_roles", displayName: "Operating Roles" },
    { code: "consumer", displayName: "Consumer" },
    { code: "saas", displayName: "SaaS" },
    { code: "hardware", displayName: "Hardware" },
  ];
  const niches: Record<string, string> = {};
  for (let i = 0; i < nicheData.length; i++) {
    const n = await db.niche.create({
      data: { id: uuid(), code: nicheData[i].code, displayName: nicheData[i].displayName, position: i + 1 },
    });
    niches[n.code] = n.id;
  }
  console.log(`  Created ${nicheData.length} niches`);

  // ─── Companies ───────────────────────────────────────────────────────
  const companyData = [
    { name: "McKinsey", category: "Consulting" },
    { name: "BCG", category: "Consulting" },
    { name: "Bain & Company", category: "Consulting" },
    { name: "Goldman Sachs", category: "Finance" },
    { name: "Flipkart", category: "E-commerce" },
    { name: "Tiger Global", category: "Investment" },
    { name: "Lightspeed Venture Partners", category: "VC" },
    { name: "Sequoia", category: "VC" },
    { name: "Razorpay", category: "Fintech" },
    { name: "FinAxis", category: "Fintech" },
  ];
  const companies: Record<string, string> = {};
  for (const c of companyData) {
    const company = await db.company.create({
      data: { id: uuid(), name: c.name, normalizedName: c.name.toLowerCase().replace(/[^a-z0-9]/g, ""), category: c.category },
    });
    companies[c.name] = company.id;
  }
  console.log(`  Created ${companyData.length} companies`);

  // ─── Signal Templates ────────────────────────────────────────────────
  const signalTemplateData = [
    { code: "seek_mentor", displayName: "Looking for a mentor in this domain", signalType: "ASK", icon: "graduation-cap", pairedCode: "offer_mentor" as string | null },
    { code: "offer_mentor", displayName: "Open to mentoring someone in my domain", signalType: "OFFER", icon: "graduation-cap", pairedCode: "seek_mentor" as string | null },
    { code: "curious_company", displayName: "Curious about working at your company", signalType: "ASK", icon: "building-2", pairedCode: "discuss_company" as string | null },
    { code: "discuss_company", displayName: "Open to discussing my company", signalType: "OFFER", icon: "building-2", pairedCode: "curious_company" as string | null },
    { code: "seek_referral", displayName: "Looking for an interview referral", signalType: "ASK", icon: "send", pairedCode: "offer_referral" as string | null },
    { code: "offer_referral", displayName: "Open to giving referrals", signalType: "OFFER", icon: "send", pairedCode: "seek_referral" as string | null },
    { code: "career_switch_ask", displayName: "Want to chat about a career switch", signalType: "ASK", icon: "arrow-right-left", pairedCode: "career_switch_offer" as string | null },
    { code: "career_switch_offer", displayName: "Open to discussing career switches into my domain", signalType: "OFFER", icon: "arrow-right-left", pairedCode: "career_switch_ask" as string | null },
    { code: "case_prep_partner", displayName: "Looking for a case prep partner", signalType: "MUTUAL", icon: "book-open", pairedCode: null },
    { code: "coffee_chat", displayName: "Open to an informal coffee chat", signalType: "MUTUAL", icon: "coffee", pairedCode: null },
    { code: "cofounder_search", displayName: "Looking for a co-founder", signalType: "MUTUAL", icon: "rocket", pairedCode: null },
  ];
  const signalTemplates: Record<string, string> = {};
  for (const st of signalTemplateData) {
    const template = await db.signalTemplate.create({
      data: { id: uuid(), code: st.code, displayNameDefault: st.displayName, signalType: st.signalType, icon: st.icon },
    });
    signalTemplates[st.code] = template.id;
  }
  for (const st of signalTemplateData) {
    if (st.pairedCode) {
      await db.signalTemplate.update({
        where: { id: signalTemplates[st.code] },
        data: { pairedTemplateId: signalTemplates[st.pairedCode] },
      });
    }
  }
  console.log(`  Created ${signalTemplateData.length} signal templates`);

  // ─── Badge Templates ─────────────────────────────────────────────────
  const badgeTemplateData = [
    { code: "current_student", displayName: "Current Student", category: "IDENTITY", verificationRequired: false },
    { code: "recent_graduate", displayName: "Recent Graduate", category: "IDENTITY", verificationRequired: false },
    { code: "alumni", displayName: "Alumni", category: "IDENTITY", verificationRequired: false },
    { code: "founder", displayName: "Founder", category: "ACHIEVEMENT", verificationRequired: true },
    { code: "founder_idea_stage", displayName: "Founder - Idea Stage", category: "ACHIEVEMENT", verificationRequired: false },
    { code: "founder_pre_revenue", displayName: "Founder - Pre-Revenue", category: "ACHIEVEMENT", verificationRequired: true },
    { code: "founder_revenue_stage", displayName: "Founder - Revenue Stage", category: "ACHIEVEMENT", verificationRequired: true },
    { code: "mentor_of_the_month", displayName: "Mentor of the Month", category: "ACHIEVEMENT", verificationRequired: false },
    { code: "top_contributor", displayName: "Top Contributor", category: "ACHIEVEMENT", verificationRequired: false },
    { code: "domain_expert", displayName: "Domain Expert", category: "SPECIAL", verificationRequired: true },
  ];
  const badgeTemplates: Record<string, string> = {};
  for (const bt of badgeTemplateData) {
    const badge = await db.badgeTemplate.create({
      data: { id: uuid(), code: bt.code, displayNameDefault: bt.displayName, category: bt.category, verificationRequired: bt.verificationRequired },
    });
    badgeTemplates[bt.code] = badge.id;
  }
  console.log(`  Created ${badgeTemplateData.length} badge templates`);

  // ─── Tenant Signals (activate all for ISB) ───────────────────────────
  const tenantSignals: Record<string, string> = {};
  for (const [code, templateId] of Object.entries(signalTemplates)) {
    const ts = await db.tenantSignal.create({ data: { id: uuid(), templateId } });
    tenantSignals[code] = ts.id;
  }
  console.log(`  Created ${Object.keys(tenantSignals).length} tenant signals for ISB`);

  // ─── Tenant Badges (activate all for ISB) ────────────────────────────
  const tenantBadges: Record<string, string> = {};
  for (const [code, templateId] of Object.entries(badgeTemplates)) {
    const tb = await db.tenantBadge.create({ data: { id: uuid(), templateId } });
    tenantBadges[code] = tb.id;
  }
  console.log(`  Created ${Object.keys(tenantBadges).length} tenant badges for ISB`);

  // ─── Users ───────────────────────────────────────────────────────────
  const usersSpec = [
    {
      email: "arjun.mehta@isb.edu", fullName: "Arjun Mehta", status: "CURRENT_STUDENT",
      graduationYear: 2026, program: "PGP", domain: "tech_product",
      niches: ["consumer", "climate", "fintech"], city: "Hyderabad", country: "India", yearsExp: 6,
      missionStatement: "Pre-MBA PM at Flipkart looking to break into early-stage venture. Curious about climate, fintech, and consumer ops at scale.",
      signals: ["seek_mentor", "curious_company", "career_switch_ask", "coffee_chat", "cofounder_search"],
      badges: ["current_student"],
      experiences: [{ company: "Flipkart", title: "Senior Product Manager", isCurrent: true }],
    },
    {
      email: "ananya.krishnan@isb.edu", fullName: "Ananya Krishnan", status: "ALUMNI",
      graduationYear: 2018, program: "PGP", domain: "vc_pe",
      niches: ["climate", "hardware", "consumer"], city: "Bangalore", country: "India", yearsExp: 8,
      missionStatement: "Building Series A bridges for Indian climate startups. Looking for operators who've scaled hardware in Tier 2 markets.",
      signals: ["offer_mentor", "discuss_company", "offer_referral", "coffee_chat"],
      badges: ["alumni", "domain_expert"],
      experiences: [
        { company: "Lightspeed Venture Partners", title: "Investor", isCurrent: true },
        { company: "McKinsey", title: "Associate", isCurrent: false },
      ],
    },
    {
      email: "vikram.subramanian@isb.edu", fullName: "Vikram Subramanian", status: "ALUMNI",
      graduationYear: 2014, program: "PGP", domain: "tech_product",
      niches: ["fintech", "ai_ml", "saas"], city: "Mumbai", country: "India", yearsExp: 12,
      missionStatement: "Scaling fraud detection for sub-prime lending. Looking for a product co-founder with scale experience.",
      signals: ["cofounder_search", "discuss_company", "offer_mentor", "coffee_chat"],
      badges: ["alumni", "founder_revenue_stage"],
      experiences: [
        { company: "FinAxis", title: "Founder & CEO", isCurrent: true },
        { company: "BCG", title: "Consultant", isCurrent: false },
      ],
    },
    {
      email: "priya.reddy@isb.edu", fullName: "Priya Reddy", status: "ALUMNI",
      graduationYear: 2020, program: "PGP", domain: "finance",
      niches: ["fintech", "consumer", "operating_roles"], city: "Hyderabad", country: "India", yearsExp: 5,
      missionStatement: "Exploring the pivot from banking to tech investing. Looking for VCs who made the switch.",
      signals: ["career_switch_ask", "seek_mentor", "curious_company", "coffee_chat"],
      badges: ["alumni"],
      experiences: [{ company: "Goldman Sachs", title: "Investment Banking Analyst", isCurrent: true }],
    },
    {
      email: "rohan.kapoor@isb.edu", fullName: "Rohan Kapoor", status: "ALUMNI",
      graduationYear: 2016, program: "PGP", domain: "vc_pe",
      niches: ["saas", "ai_ml", "consumer"], city: "Mumbai", country: "India", yearsExp: 10,
      missionStatement: "Growth investing in Indian SaaS. Open to mentoring current students exploring PE/VC.",
      signals: ["offer_mentor", "discuss_company", "offer_referral", "coffee_chat"],
      badges: ["alumni", "top_contributor"],
      experiences: [
        { company: "Tiger Global", title: "Principal", isCurrent: true },
        { company: "Bain & Company", title: "Senior Associate", isCurrent: false },
      ],
    },
    {
      email: "rajesh.iyer@isb.edu", fullName: "Rajesh Iyer", status: "ALUMNI",
      graduationYear: 2010, program: "PGP", domain: "strategy_consulting",
      niches: ["operating_roles", "public_policy", "consumer"], city: "Mumbai", country: "India", yearsExp: 16,
      missionStatement: "Helping the next generation of consultants think about operating roles. Open to structured mentorship.",
      signals: ["offer_mentor", "career_switch_offer", "discuss_company", "coffee_chat"],
      badges: ["alumni", "mentor_of_the_month", "domain_expert"],
      experiences: [{ company: "Bain & Company", title: "Partner", isCurrent: true }],
    },
  ];

  const userIds: Record<string, string> = {};

  for (const spec of usersSpec) {
    const userId = uuid();
    userIds[spec.email] = userId;

    await db.user.create({
      data: {
        id: userId, email: spec.email, fullName: spec.fullName, hashedPassword,
        tenantId: tenant.id, institutionMemberStatus: spec.status,
        graduationYear: spec.graduationYear, program: spec.program, lastActiveAt: new Date(),
      },
    });

    await db.userProfile.create({
      data: {
        id: uuid(), userId, missionStatement: spec.missionStatement,
        domainId: domains[spec.domain], currentCity: spec.city, currentCountry: spec.country,
        yearsOfExperienceCached: spec.yearsExp, profileCompletenessScore: 85,
      },
    });

    await db.userEducation.create({
      data: { id: uuid(), userId, programName: spec.program, batchYear: spec.graduationYear, verified: true },
    });

    for (const exp of spec.experiences) {
      await db.userExperience.create({
        data: {
          id: uuid(), userId, companyId: companies[exp.company] ?? null,
          freeTextCompanyName: companies[exp.company] ? null : exp.company,
          title: exp.title, isCurrent: exp.isCurrent,
          startDate: new Date(spec.graduationYear - (exp.isCurrent ? 0 : 2), 0, 1),
          endDate: exp.isCurrent ? null : new Date(spec.graduationYear, 0, 1),
          verified: true,
        },
      });
    }

    for (let i = 0; i < spec.niches.length; i++) {
      await db.userNiche.create({ data: { userId, nicheId: niches[spec.niches[i]], position: i + 1 } });
    }

    for (const signalCode of spec.signals) {
      await db.userOpenSignal.create({ data: { userId, tenantSignalId: tenantSignals[signalCode], isOpen: true } });
    }

    for (const badgeCode of spec.badges) {
      await db.userBadge.create({ data: { id: uuid(), userId, tenantBadgeId: tenantBadges[badgeCode] } });
    }

    await db.userGamificationState.create({
      data: {
        userId,
        totalPoints: spec.status === "CURRENT_STUDENT" ? 10 : Math.floor(Math.random() * 150) + 25,
        currentLevel: spec.status === "CURRENT_STUDENT" ? 1 : 2,
      },
    });
  }
  console.log(`  Created ${usersSpec.length} users with profiles, education, experience, niches, signals, badges, and gamification`);

  // ─── Sample nudges for Arjun ─────────────────────────────────────────
  const arjunId = userIds["arjun.mehta@isb.edu"];
  const rajeshId = userIds["rajesh.iyer@isb.edu"];
  const ananyaId = userIds["ananya.krishnan@isb.edu"];
  const rohanId = userIds["rohan.kapoor@isb.edu"];

  const nudge1Id = uuid();
  await db.nudge.create({
    data: {
      id: nudge1Id, senderUserId: arjunId, receiverUserId: rajeshId,
      message: "Hi Rajesh, I'm a current PGP student exploring the consulting-to-ops switch. Your mentorship offer caught my eye. Would love 20 mins of your time!",
      status: "ACCEPTED",
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      respondedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      responseMessage: "Happy to chat, Arjun. Let's set up a time.",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await db.nudgeSignal.create({ data: { nudgeId: nudge1Id, tenantSignalId: tenantSignals["seek_mentor"] } });

  const nudge2Id = uuid();
  await db.nudge.create({
    data: {
      id: nudge2Id, senderUserId: arjunId, receiverUserId: ananyaId,
      message: "Hi Ananya, I'm fascinated by climate investing in India. Would love to hear about the Lightspeed perspective on hardware startups.",
      status: "SENT",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
  });
  await db.nudgeSignal.create({ data: { nudgeId: nudge2Id, tenantSignalId: tenantSignals["curious_company"] } });

  const nudge3Id = uuid();
  await db.nudge.create({
    data: {
      id: nudge3Id, senderUserId: rohanId, receiverUserId: arjunId,
      message: "Hey Arjun, saw your interest in venture. Tiger Global is always looking for strong PMs from Flipkart. Happy to chat.",
      status: "SENT",
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    },
  });
  await db.nudgeSignal.create({ data: { nudgeId: nudge3Id, tenantSignalId: tenantSignals["offer_referral"] } });

  await db.nudgeRelationship.create({
    data: { senderUserId: arjunId, receiverUserId: rajeshId, lastNudgedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), countLifetime: 1, lastOutcome: "ACCEPTED" },
  });
  await db.nudgeRelationship.create({
    data: { senderUserId: arjunId, receiverUserId: ananyaId, lastNudgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), countLifetime: 1 },
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  await db.nudgeQuota.create({ data: { userId: arjunId, weekStartDate: weekStart, nudgesSentCount: 2, weeklyLimit: 5 } });
  console.log("  Created sample nudges for Arjun");

  // ─── Conversation between Arjun and Rajesh ───────────────────────────
  const conversationId = uuid();
  await db.conversation.create({
    data: { id: conversationId, userAId: arjunId, userBId: rajeshId, lastMessageAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), originatedFromNudgeId: nudge1Id },
  });
  await db.nudge.update({ where: { id: nudge1Id }, data: { conversationId } });

  await db.message.create({
    data: {
      id: uuid(), conversationId, senderUserId: arjunId,
      body: "Thank you for accepting, Rajesh! Really appreciate it. I've been thinking about whether the consulting-to-ops transition is better done before or after an MBA.",
      sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      readAtByRecipient: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 3600000),
    },
  });
  await db.message.create({
    data: {
      id: uuid(), conversationId, senderUserId: rajeshId,
      body: "Great question. In my experience at Bain, I've seen both paths work. The key is clarity of intent - what kind of operating role, what sector, and at what stage of company. Let's discuss specifics.",
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      readAtByRecipient: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000),
    },
  });
  await db.message.create({
    data: {
      id: uuid(), conversationId, senderUserId: arjunId,
      body: "That makes sense. I'm most drawn to early-stage consumer or climate startups - COO or Head of Ops type roles. My Flipkart experience gives me marketplace ops depth. Do you see consulting experience as complementary or redundant for that path?",
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10800000),
    },
  });
  console.log("  Created conversation between Arjun and Rajesh");

  // ─── Gamification Rules ──────────────────────────────────────────────
  const gamificationRules = [
    { eventType: "NUDGE_SENT", pointsValue: 5 },
    { eventType: "NUDGE_ACCEPTED", pointsValue: 10 },
    { eventType: "NUDGE_RESPONDED", pointsValue: 5 },
    { eventType: "MESSAGE_SENT", pointsValue: 2 },
    { eventType: "PROFILE_COMPLETED", pointsValue: 20 },
    { eventType: "SURVEY_COMPLETED", pointsValue: 15 },
    { eventType: "EVENT_ATTENDED", pointsValue: 10 },
    { eventType: "EVENT_HOSTED", pointsValue: 25 },
    { eventType: "MENTORSHIP_SESSION_COMPLETED", pointsValue: 15 },
    { eventType: "RESOURCE_SHARED", pointsValue: 10 },
    { eventType: "REFERRAL_GIVEN", pointsValue: 10 },
  ];
  for (const rule of gamificationRules) {
    await db.gamificationRule.create({ data: { id: uuid(), eventType: rule.eventType, pointsValue: rule.pointsValue, isActive: true } });
  }
  console.log(`  Created ${gamificationRules.length} gamification rules`);

  // ─── Level Definitions ───────────────────────────────────────────────
  const levels = [
    { levelNumber: 1, displayName: "Newcomer", pointsRequired: 0 },
    { levelNumber: 2, displayName: "Contributor", pointsRequired: 25 },
    { levelNumber: 3, displayName: "Connector", pointsRequired: 75 },
    { levelNumber: 4, displayName: "Pillar", pointsRequired: 200 },
  ];
  for (const level of levels) {
    await db.levelDefinition.create({ data: { id: uuid(), levelNumber: level.levelNumber, displayName: level.displayName, pointsRequired: level.pointsRequired } });
  }
  console.log(`  Created ${levels.length} level definitions`);

  // ─── Sample Survey: Career Fork ──────────────────────────────────────
  const surveyId = uuid();
  await db.survey.create({
    data: {
      id: surveyId, title: "Career Fork",
      description: "Help us understand your career trajectory and interests so we can match you with like-minded peers for a focused conversation.",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      matchingStrategy: "COMPLEMENTARITY", matchGroupSizeMin: 4, matchGroupSizeMax: 6,
    },
  });

  const surveyQuestions = [
    { questionText: "What best describes your current career stage?", questionType: "SINGLE_SELECT", options: ["Current student / pre-MBA", "Early career (0-3 years post-MBA)", "Mid career (4-8 years post-MBA)", "Senior / Leadership (9+ years post-MBA)"] },
    { questionText: "Which domain are you most active in right now?", questionType: "SINGLE_SELECT", options: ["Strategy & Consulting", "Finance / Investment Banking", "VC / PE", "Tech / Product", "Entrepreneurship", "Public Policy / Social Impact", "Other"] },
    { questionText: "Are you considering a career switch in the next 12 months?", questionType: "SINGLE_SELECT", options: ["Yes, actively exploring", "Maybe, open to the right opportunity", "No, I'm doubling down on my current path"] },
    { questionText: "If switching, which domain are you most curious about?", questionType: "MULTI_SELECT", options: ["Venture Capital / PE", "Startups / Founding", "Product / Tech", "Operating roles at scale-ups", "Social impact / Policy", "Not switching"] },
    { questionText: "What would make a conversation with a matched peer most valuable?", questionType: "MULTI_SELECT", options: ["Hearing their career transition story", "Getting practical advice on breaking in", "Expanding my network in a new domain", "Finding a co-founder or collaborator", "Structured mentorship"] },
    { questionText: "What is your preferred conversation format?", questionType: "SINGLE_SELECT", options: ["1-on-1 virtual coffee chat", "Small group (3-4 people) discussion", "In-person meetup if in the same city", "No preference"] },
    { questionText: "How much time can you commit to a matched conversation per month?", questionType: "SINGLE_SELECT", options: ["30 minutes", "1 hour", "2+ hours", "Depends on the match quality"] },
  ];

  for (let qi = 0; qi < surveyQuestions.length; qi++) {
    const sq = surveyQuestions[qi];
    const questionId = uuid();
    await db.surveyQuestion.create({ data: { id: questionId, surveyId, position: qi + 1, questionText: sq.questionText, questionType: sq.questionType, isRequired: true } });
    for (let oi = 0; oi < sq.options.length; oi++) {
      await db.surveyOption.create({
        data: { id: uuid(), questionId, position: oi + 1, optionText: sq.options[oi], optionValue: sq.options[oi].toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") },
      });
    }
  }
  console.log("  Created Career Fork survey with 7 questions");

  // ─── SuperAdmin ────────────────────────────────────────────────────
  const superAdminPassword = await hash("superadmin123", 12);
  await db.superAdmin.create({
    data: {
      id: uuid(),
      email: "admin@complyark.com",
      name: "Platform Admin",
      hashedPassword: superAdminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("  Created SuperAdmin: admin@complyark.com");

  // ─── Matching Configs ──────────────────────────────────────────────
  const matchingConfigs = [
    { matchType: "ONE_TO_ONE", frequency: "WEEKLY", isEnabled: true },
    { matchType: "GROUP", frequency: "WEEKLY", isEnabled: true },
    { matchType: "MENTORSHIP", frequency: "BIWEEKLY", isEnabled: true },
  ];
  for (const mc of matchingConfigs) {
    await db.matchingConfig.create({
      data: {
        id: uuid(),
        tenantId: tenant.id,
        matchType: mc.matchType,
        frequency: mc.frequency,
        isEnabled: mc.isEnabled,
      },
    });
  }
  console.log("  Created 3 matching configs");

  // ─── Niche Group Conversations ────────────────────────────────────
  const allNiches = await db.niche.findMany();
  for (const niche of allNiches) {
    await db.groupConversation.create({
      data: {
        id: uuid(),
        name: niche.displayName,
        nicheId: niche.id,
      },
    });
  }
  console.log(`  Created ${allNiches.length} niche group conversations`);

  // ─── Mock Matching Run ─────────────────────────────────────────────
  const matchingRunId = uuid();
  await db.matchingRun.create({
    data: {
      id: matchingRunId,
      matchType: "ONE_TO_ONE",
      status: "COMPLETED",
      completedAt: new Date(),
      usersConsidered: 6,
      matchesCreated: 4,
    },
  });

  // ─── 1:1 Matches ──────────────────────────────────────────────────
  const arjun = userIds["arjun.mehta@isb.edu"];
  const ananya = userIds["ananya.krishnan@isb.edu"];
  const vikram = userIds["vikram.subramanian@isb.edu"];
  const priya = userIds["priya.reddy@isb.edu"];
  const rohan = userIds["rohan.kapoor@isb.edu"];
  const rajesh = userIds["rajesh.iyer@isb.edu"];

  // Match 1: Arjun <-> Ananya (pending — Arjun seeks mentor, Ananya offers)
  await db.match.create({
    data: {
      id: uuid(), matchType: "ONE_TO_ONE", userAId: arjun, userBId: ananya,
      status: "NOTIFIED", userAStatus: "PENDING", userBStatus: "PENDING",
      matchScore: 0.87, matchReason: "Shared interest in Climate, Complementary signals: seek_mentor ↔ offer_mentor",
      matchingRunId, notifiedAt: new Date(Date.now() - 2 * 3600000),
    },
  });

  // Match 2: Arjun <-> Vikram (active — both accepted, conversation created)
  const match2Id = uuid();
  const conv2Id = uuid();
  await db.match.create({
    data: {
      id: match2Id, matchType: "ONE_TO_ONE", userAId: arjun, userBId: vikram,
      status: "ACTIVE", userAStatus: "ACCEPTED", userBStatus: "ACCEPTED",
      matchScore: 0.92, matchReason: "Shared niche: Fintech, Both in Tech/Product domain, Cofounder search signal",
      matchingRunId, notifiedAt: new Date(Date.now() - 48 * 3600000),
      acceptedAt: new Date(Date.now() - 24 * 3600000),
    },
  });
  await db.conversation.create({
    data: {
      id: conv2Id, userAId: arjun, userBId: vikram, matchId: match2Id,
      lastMessageAt: new Date(Date.now() - 2 * 3600000),
    },
  });
  await db.message.create({
    data: {
      id: uuid(), conversationId: conv2Id, senderUserId: vikram,
      body: "Hey Arjun! Great to be matched. I saw you're interested in fintech and looking for a co-founder. I'm building fraud detection at FinAxis — would love to chat about your ideas.",
      sentAt: new Date(Date.now() - 22 * 3600000),
    },
  });
  await db.message.create({
    data: {
      id: uuid(), conversationId: conv2Id, senderUserId: arjun,
      body: "Vikram! This is exactly the kind of connection I was hoping for. I've been thinking about embedded lending products — your fraud detection angle is fascinating. Free this week?",
      sentAt: new Date(Date.now() - 20 * 3600000),
    },
  });
  await db.message.create({
    data: {
      id: uuid(), conversationId: conv2Id, senderUserId: vikram,
      body: "Absolutely. How about Thursday afternoon? We can grab coffee at the campus cafe.",
      sentAt: new Date(Date.now() - 2 * 3600000),
    },
  });

  // Match 3: Mentorship — Priya <-> Rohan (pending for Priya)
  await db.match.create({
    data: {
      id: uuid(), matchType: "MENTORSHIP", userAId: priya, userBId: rohan,
      status: "NOTIFIED", userAStatus: "PENDING", userBStatus: "ACCEPTED",
      matchScore: 0.81, matchReason: "Priya seeks mentor for career switch to VC, Rohan offers mentorship in PE/VC",
      matchingRunId, notifiedAt: new Date(Date.now() - 6 * 3600000),
    },
  });

  // Match 4: Completed — Rajesh <-> Arjun (completed mentorship)
  const match4Id = uuid();
  const conv4Id = uuid();
  await db.match.create({
    data: {
      id: match4Id, matchType: "MENTORSHIP", userAId: rajesh, userBId: arjun,
      status: "COMPLETED", userAStatus: "ACCEPTED", userBStatus: "ACCEPTED",
      matchScore: 0.79, matchReason: "Arjun exploring consulting to operations switch, Rajesh experienced in same transition",
      matchingRunId, notifiedAt: new Date(Date.now() - 30 * 24 * 3600000),
      acceptedAt: new Date(Date.now() - 28 * 24 * 3600000),
      completedAt: new Date(Date.now() - 3 * 24 * 3600000),
    },
  });
  await db.conversation.create({
    data: {
      id: conv4Id, userAId: rajesh, userBId: arjun, matchId: match4Id,
      lastMessageAt: new Date(Date.now() - 3 * 24 * 3600000),
    },
  });
  await db.mentorship.create({
    data: {
      id: uuid(), conversationId: conv4Id, mentorUserId: rajesh, menteeUserId: arjun,
      proposedByUserId: rajesh, matchId: match4Id, status: "COMPLETED",
      goal: "Navigate the consulting-to-operations career transition",
      cadence: "EVERY_2_WEEKS", startedAt: new Date(Date.now() - 28 * 24 * 3600000),
      endedAt: new Date(Date.now() - 3 * 24 * 3600000), completionReason: "Goal achieved",
    },
  });
  console.log("  Created 4 mock matches (1 pending, 1 active with chat, 1 mentorship pending, 1 completed)");

  // ─── Group Match ───────────────────────────────────────────────────
  const groupMatch1Id = uuid();
  const groupConv1Id = uuid();
  await db.groupMatch.create({
    data: {
      id: groupMatch1Id, status: "ACTIVE", matchScore: 0.85,
      matchReason: "Fintech enthusiasts group — shared niche and complementary experience levels",
      matchingRunId, groupSize: 3, activatedAt: new Date(Date.now() - 5 * 24 * 3600000),
    },
  });
  // Link to fintech niche
  await db.groupMatchNiche.create({
    data: { groupMatchId: groupMatch1Id, nicheId: niches["fintech"] },
  });
  // Add members
  for (const uid of [arjun, vikram, priya]) {
    await db.groupMatchMember.create({
      data: { groupMatchId: groupMatch1Id, userId: uid, status: "ACCEPTED", fitScore: 0.85, respondedAt: new Date() },
    });
  }
  // Create group conversation
  await db.groupConversation.create({
    data: { id: groupConv1Id, name: "Fintech Circle", groupMatchId: groupMatch1Id, lastMessageAt: new Date(Date.now() - 3600000) },
  });
  for (const uid of [arjun, vikram, priya]) {
    await db.groupConversationMember.create({
      data: { groupConversationId: groupConv1Id, userId: uid },
    });
  }
  await db.groupMessage.create({
    data: { id: uuid(), groupConversationId: groupConv1Id, senderUserId: vikram, body: "Welcome to the Fintech Circle! Excited to have this group together. Anyone following the new UPI regulations?", sentAt: new Date(Date.now() - 24 * 3600000) },
  });
  await db.groupMessage.create({
    data: { id: uuid(), groupConversationId: groupConv1Id, senderUserId: priya, body: "Yes! The impact on cross-border payments is going to be massive. Would love to discuss the implications for lending.", sentAt: new Date(Date.now() - 12 * 3600000) },
  });
  await db.groupMessage.create({
    data: { id: uuid(), groupConversationId: groupConv1Id, senderUserId: arjun, body: "Count me in. I've been digging into embedded finance models — we should do a knowledge share session.", sentAt: new Date(Date.now() - 3600000) },
  });

  // Group match 2: Pending (Climate group)
  const groupMatch2Id = uuid();
  await db.groupMatch.create({
    data: {
      id: groupMatch2Id, status: "NOTIFIED", matchScore: 0.78,
      matchReason: "Climate-tech group — shared niche in sustainability and climate innovation",
      matchingRunId, groupSize: 3,
    },
  });
  await db.groupMatchNiche.create({
    data: { groupMatchId: groupMatch2Id, nicheId: niches["climate"] },
  });
  await db.groupMatchMember.create({
    data: { groupMatchId: groupMatch2Id, userId: arjun, status: "ACCEPTED", fitScore: 0.80, respondedAt: new Date() },
  });
  await db.groupMatchMember.create({
    data: { groupMatchId: groupMatch2Id, userId: ananya, status: "PENDING", fitScore: 0.82 },
  });
  await db.groupMatchMember.create({
    data: { groupMatchId: groupMatch2Id, userId: priya, status: "PENDING", fitScore: 0.75 },
  });
  console.log("  Created 2 group matches (1 active with chat, 1 pending)");

  // ─── Feed Posts ────────────────────────────────────────────────────
  const post1Id = uuid();
  const post2Id = uuid();
  const post3Id = uuid();
  const post4Id = uuid();
  const post5Id = uuid();

  await db.post.create({
    data: {
      id: post1Id, authorId: arjun, feedType: "CAMPUS", body: "Anyone else attending the fintech workshop this Thursday? Heard the speaker from Razorpay is going to talk about the future of UPI 3.0. Would be great to grab lunch after and discuss.", status: "ACTIVE",
      createdAt: new Date(Date.now() - 2 * 3600000),
    },
  });
  await db.postReply.create({ data: { id: uuid(), postId: post1Id, authorId: priya, body: "I'll be there! Let's definitely connect after. I have some questions about their international expansion.", createdAt: new Date(Date.now() - 1.5 * 3600000) } });
  await db.postReply.create({ data: { id: uuid(), postId: post1Id, authorId: vikram, body: "Can't make it in person but would love a recap. Maybe someone can post key takeaways here?", createdAt: new Date(Date.now() - 1 * 3600000) } });

  await db.post.create({
    data: {
      id: post2Id, authorId: priya, feedType: "CAMPUS", body: "Study group for the Operations Management midterm? Thinking we meet at the library tomorrow at 6pm. DM me if interested — I have notes from last year's exam.", status: "ACTIVE",
      createdAt: new Date(Date.now() - 8 * 3600000),
    },
  });
  await db.postReply.create({ data: { id: uuid(), postId: post2Id, authorId: arjun, body: "Count me in! I'll bring the coffee ☕", createdAt: new Date(Date.now() - 7 * 3600000) } });

  await db.post.create({
    data: {
      id: post3Id, authorId: ananya, feedType: "NETWORK", body: "We just closed a Series A for an incredible climate-tech startup out of Bangalore. The founders are ISB alumni (Class of 2019). Proud of this community — the ISB network in climate keeps growing. Happy to make introductions for anyone interested in the space.", status: "ACTIVE",
      createdAt: new Date(Date.now() - 24 * 3600000),
    },
  });
  await db.postReply.create({ data: { id: uuid(), postId: post3Id, authorId: rohan, body: "Congratulations Ananya! We looked at this deal too — fantastic team. The ISB climate network is really something special.", createdAt: new Date(Date.now() - 20 * 3600000) } });
  await db.postReply.create({ data: { id: uuid(), postId: post3Id, authorId: arjun, body: "This is inspiring! Would love an intro to the founders. I'm exploring climate-fintech intersections for my thesis.", createdAt: new Date(Date.now() - 18 * 3600000) } });
  await db.postReply.create({ data: { id: uuid(), postId: post3Id, authorId: rajesh, body: "Great to see the network creating real value. Would be happy to share some operational scaling insights if the founders need it.", createdAt: new Date(Date.now() - 12 * 3600000) } });

  await db.post.create({
    data: {
      id: post4Id, authorId: rajesh, feedType: "NETWORK", body: "Reflecting on 15 years post-ISB: the single best career decision I made was moving from consulting to an operating role. It was terrifying at the time, but the learning curve in Year 1 as a COO was steeper than 5 years of strategy work. Happy to chat with anyone considering the same leap.", status: "ACTIVE",
      createdAt: new Date(Date.now() - 48 * 3600000),
    },
  });
  await db.postReply.create({ data: { id: uuid(), postId: post4Id, authorId: priya, body: "This resonates so much. I'm at that exact crossroads right now. Would love to hear more about how you made the decision.", createdAt: new Date(Date.now() - 44 * 3600000) } });
  await db.postReply.create({ data: { id: uuid(), postId: post4Id, authorId: vikram, body: "Can confirm. Made a similar move from consulting to founding. The first 6 months are brutal but transformative.", createdAt: new Date(Date.now() - 40 * 3600000) } });

  await db.post.create({
    data: {
      id: post5Id, authorId: rohan, feedType: "NETWORK", body: "We're hiring a VP of Growth at one of our portfolio companies (B2B SaaS, Series B, Bangalore). ISB alumni preferred. Strong unit economics, 3x ARR growth. DM me for details.", status: "ACTIVE",
      createdAt: new Date(Date.now() - 72 * 3600000),
    },
  });
  await db.postReply.create({ data: { id: uuid(), postId: post5Id, authorId: ananya, body: "Shared with a couple of people from our network who might be a fit. Great opportunity!", createdAt: new Date(Date.now() - 68 * 3600000) } });

  console.log("  Created 5 feed posts with replies (2 Campus, 3 Network)");

  // ─── Events / Activities ───────────────────────────────────────────
  const event1Id = uuid();
  const event2Id = uuid();
  const event3Id = uuid();
  const event4Id = uuid();

  // Public event by user
  await db.event.create({
    data: {
      id: event1Id, title: "Fintech Founders Fireside Chat", description: "An informal evening with fintech founders from the ISB network. Hear about their journeys, failures, and what they wish they knew before starting. Open to all students and alumni.",
      source: "USER_CREATED", eventType: "TALK", startsAt: new Date(Date.now() + 3 * 24 * 3600000),
      endsAt: new Date(Date.now() + 3 * 24 * 3600000 + 2 * 3600000),
      isPublished: true, visibility: "PUBLIC", createdByUserId: vikram, location: "LRC Auditorium, ISB Hyderabad",
      capacity: 50,
    },
  });
  await db.eventNiche.create({ data: { eventId: event1Id, nicheId: niches["fintech"] } });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event1Id, userId: arjun, status: "ATTENDING" } });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event1Id, userId: priya, status: "ATTENDING" } });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event1Id, userId: ananya, status: "ATTENDING" } });

  // Private event
  await db.event.create({
    data: {
      id: event2Id, title: "Climate VC Deal Review (Invite Only)", description: "Monthly deal review session for climate-focused investors. We'll review 3 deals in pipeline and discuss market trends.",
      source: "USER_CREATED", eventType: "WORKSHOP", startsAt: new Date(Date.now() + 7 * 24 * 3600000),
      endsAt: new Date(Date.now() + 7 * 24 * 3600000 + 3 * 3600000),
      isPublished: true, visibility: "PRIVATE", createdByUserId: ananya, location: "Zoom (link shared on invite)",
      capacity: 12,
    },
  });
  await db.eventNiche.create({ data: { eventId: event2Id, nicheId: niches["climate"] } });
  await db.eventInvite.create({ data: { id: uuid(), eventId: event2Id, inviterId: ananya, inviteeId: rohan, status: "ACCEPTED" } });
  await db.eventInvite.create({ data: { id: uuid(), eventId: event2Id, inviterId: ananya, inviteeId: arjun, status: "PENDING" } });

  // Public campus event
  await db.event.create({
    data: {
      id: event3Id, title: "Weekend Cricket Match - ISB vs Faculty", description: "Annual cricket match between students and faculty. Come cheer or play! Sign up in comments. Refreshments provided.",
      source: "USER_CREATED", eventType: "OTHER", startsAt: new Date(Date.now() + 5 * 24 * 3600000),
      endsAt: new Date(Date.now() + 5 * 24 * 3600000 + 4 * 3600000),
      isPublished: true, visibility: "PUBLIC", createdByUserId: arjun, location: "ISB Cricket Ground",
      capacity: 100,
    },
  });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event3Id, userId: priya, status: "ATTENDING" } });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event3Id, userId: vikram, status: "ATTENDING" } });

  // Networking dinner
  await db.event.create({
    data: {
      id: event4Id, title: "Alumni Networking Dinner - Mumbai Chapter", description: "Quarterly dinner for ISB Mumbai alumni. Great food, better conversations. Bring a plus-one who might be interested in ISB.",
      source: "USER_CREATED", eventType: "DINNER", startsAt: new Date(Date.now() + 14 * 24 * 3600000),
      endsAt: new Date(Date.now() + 14 * 24 * 3600000 + 3 * 3600000),
      isPublished: true, visibility: "PUBLIC", createdByUserId: rajesh, location: "The Table, Colaba, Mumbai",
      capacity: 30,
    },
  });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event4Id, userId: rohan, status: "ATTENDING" } });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event4Id, userId: vikram, status: "ATTENDING" } });
  await db.eventRsvp.create({ data: { id: uuid(), eventId: event4Id, userId: ananya, status: "ATTENDING" } });

  console.log("  Created 4 events (2 public, 1 private, 1 dinner) with RSVPs and invites");

  // ─── Notifications ─────────────────────────────────────────────────
  await db.notification.create({
    data: { id: uuid(), userId: arjun, type: "MATCH_CREATED", title: "New Match!", body: "You've been matched with Ananya Krishnan based on shared interests in Climate", relatedEntityType: "MATCH", createdAt: new Date(Date.now() - 2 * 3600000) },
  });
  await db.notification.create({
    data: { id: uuid(), userId: arjun, type: "GROUP_MATCH_CREATED", title: "New Group Match!", body: "You've been added to the Climate-Tech group with 2 other members", relatedEntityType: "GROUP_MATCH", createdAt: new Date(Date.now() - 4 * 3600000) },
  });
  await db.notification.create({
    data: { id: uuid(), userId: arjun, type: "EVENT_REMINDER", title: "Event This Week", body: "Fintech Founders Fireside Chat is in 3 days. Don't forget to RSVP!", relatedEntityType: "EVENT", relatedEntityId: event1Id, createdAt: new Date(Date.now() - 6 * 3600000) },
  });
  await db.notification.create({
    data: { id: uuid(), userId: arjun, type: "NUDGE_RECEIVED", title: "New Nudge", body: "Priya Reddy wants to connect with you", createdAt: new Date(Date.now() - 12 * 3600000) },
  });
  console.log("  Created 4 notifications for Arjun (demo user)");

  console.log("\nSeeding complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
