import { PrismaClient } from "./generated/prisma/client.js";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // add 'query' during debugging if you like
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
