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
  console.log("Clean seeding — structural data only (no demo users)...\n");

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
  for (let i = 0; i < domainData.length; i++) {
    await db.domain.create({
      data: { id: uuid(), code: domainData[i].code, displayName: domainData[i].displayName, position: i + 1 },
    });
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
  for (let i = 0; i < nicheData.length; i++) {
    await db.niche.create({
      data: { id: uuid(), code: nicheData[i].code, displayName: nicheData[i].displayName, position: i + 1 },
    });
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
  for (const c of companyData) {
    await db.company.create({
      data: { id: uuid(), name: c.name, normalizedName: c.name.toLowerCase().replace(/[^a-z0-9]/g, ""), category: c.category },
    });
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
  for (const [, templateId] of Object.entries(signalTemplates)) {
    await db.tenantSignal.create({ data: { id: uuid(), templateId } });
  }
  console.log(`  Created ${Object.keys(signalTemplates).length} tenant signals for ISB`);

  // ─── Tenant Badges (activate all for ISB) ────────────────────────────
  for (const [, templateId] of Object.entries(badgeTemplates)) {
    await db.tenantBadge.create({ data: { id: uuid(), templateId } });
  }
  console.log(`  Created ${Object.keys(badgeTemplates).length} tenant badges for ISB`);

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
      data: { id: uuid(), tenantId: tenant.id, matchType: mc.matchType, frequency: mc.frequency, isEnabled: mc.isEnabled },
    });
  }
  console.log("  Created 3 matching configs");

  // ─── Niche Group Conversations ────────────────────────────────────
  const allNiches = await db.niche.findMany();
  for (const niche of allNiches) {
    await db.groupConversation.create({
      data: { id: uuid(), name: niche.displayName, nicheId: niche.id },
    });
  }
  console.log(`  Created ${allNiches.length} niche group conversations`);

  console.log("\nClean seeding complete! App is ready for real users.");
  await db.$disconnect();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
