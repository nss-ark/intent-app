import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
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

  console.log("\nSeeding complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
