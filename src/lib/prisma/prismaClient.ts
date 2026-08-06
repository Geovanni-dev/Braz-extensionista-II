/* we create a singleton instance of PrismaClient to avoid creating multiple instances in development,
which can lead to issues with hot reloading and database connections*/
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }; // Global reference to avoid multiple Prisma instances during hot-reload.

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
