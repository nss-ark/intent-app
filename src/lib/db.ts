import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

/**
 * Database client singleton.
 *
 * Currently uses SQLite via BetterSqlite3 for local development.
 * To switch to Postgres for production:
 * 1. Update prisma/schema.prisma: change provider to "postgresql"
 * 2. Set DATABASE_URL to a Postgres connection string
 * 3. Remove the BetterSqlite3 adapter below
 * 4. Run `npx prisma generate` and `npx prisma migrate deploy`
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const dbFile = databaseUrl.replace("file:", "").replace("./", "");
  const fullPath = path.isAbsolute(dbFile)
    ? dbFile
    : path.join(process.cwd(), dbFile);

  const adapter = new PrismaBetterSqlite3({ url: fullPath });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
