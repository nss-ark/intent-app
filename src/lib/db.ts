import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  // Production: PostgreSQL (no adapter needed)
  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    return new PrismaClient();
  }

  // Local dev: SQLite via BetterSqlite3
  const dbFile = databaseUrl.replace("file:", "").replace("./", "");
  const fullPath = path.isAbsolute(dbFile)
    ? dbFile
    : path.join(process.cwd(), dbFile);

  const adapter = new PrismaBetterSqlite3({ url: fullPath });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
