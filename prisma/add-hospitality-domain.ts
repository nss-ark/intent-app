/**
 * Migration script: add new domains (Sales, Marketing, Hospitality & Services)
 * and replace old industry-mix niches with functional specializations.
 *
 * Run: npx tsx prisma/add-hospitality-domain.ts
 *
 * Safe to run multiple times — uses upserts on unique codes.
 * Old niches are soft-deactivated (isActive=false), not deleted,
 * so existing user selections remain in the DB but won't show in the UI.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { v4 as uuid } from "uuid";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString: url });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Migrating domains and niches...\n");

  // ─── New Domains ───────────────────────────────────────────────────
  const newDomains = [
    { code: "sales", displayName: "Sales" },
    { code: "marketing", displayName: "Marketing" },
    { code: "hospitality_services", displayName: "Hospitality & Services" },
  ];

  const lastDomain = await db.domain.findFirst({ orderBy: { position: "desc" } });
  let pos = (lastDomain?.position ?? 0) + 1;

  for (const d of newDomains) {
    const result = await db.domain.upsert({
      where: { code: d.code },
      update: { displayName: d.displayName, isActive: true },
      create: { id: uuid(), code: d.code, displayName: d.displayName, position: pos++, isActive: true },
    });
    console.log(`  Domain: ${result.displayName} (${result.id})`);
  }

  // ─── Deactivate old industry-mix niches ────────────────────────────
  const oldNicheCodes = [
    "ai_ml", "fintech", "climate", "healthtech", "edtech",
    "public_policy", "operating_roles", "consumer", "saas", "hardware",
  ];

  const deactivated = await db.niche.updateMany({
    where: { code: { in: oldNicheCodes } },
    data: { isActive: false },
  });
  console.log(`\n  Deactivated ${deactivated.count} old niches`);

  // ─── Add new functional niches ─────────────────────────────────────
  const newNiches = [
    { code: "product_management", displayName: "Product Management" },
    { code: "data_analytics", displayName: "Data Science & Analytics" },
    { code: "strategy", displayName: "Strategy" },
    { code: "operations", displayName: "Operations" },
    { code: "business_development", displayName: "Business Development" },
    { code: "entrepreneurship", displayName: "Entrepreneurship" },
    { code: "investment_management", displayName: "Investment Management" },
    { code: "digital_marketing", displayName: "Digital Marketing" },
    { code: "supply_chain", displayName: "Supply Chain" },
    { code: "people_hr", displayName: "People & HR" },
    { code: "brand_management", displayName: "Brand Management" },
    { code: "sustainability_esg", displayName: "Sustainability & ESG" },
    { code: "design_ux", displayName: "Design & UX" },
    { code: "software_engineering", displayName: "Software Engineering" },
  ];

  let nichePos = 1;
  for (const n of newNiches) {
    const result = await db.niche.upsert({
      where: { code: n.code },
      update: { displayName: n.displayName, isActive: true, position: nichePos },
      create: { id: uuid(), code: n.code, displayName: n.displayName, position: nichePos, isActive: true },
    });
    console.log(`  Niche: ${result.displayName} (${result.id})`);
    nichePos++;
  }

  // ─── Create group conversations for new niches (if missing) ────────
  const activeNiches = await db.niche.findMany({ where: { isActive: true } });
  for (const niche of activeNiches) {
    const existing = await db.groupConversation.findFirst({ where: { nicheId: niche.id } });
    if (!existing) {
      await db.groupConversation.create({
        data: { id: uuid(), name: niche.displayName, nicheId: niche.id },
      });
      console.log(`  Created group conversation for: ${niche.displayName}`);
    }
  }

  console.log("\nMigration complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
