import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  for (const directory of [process.cwd(), resolve(process.cwd(), ".."), resolve(process.cwd(), "../..")]) {
    loadEnvConfig(directory, false, { info: () => {}, error: () => {} });
    if (process.env.DATABASE_URL) {
      break;
    }
  }
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
