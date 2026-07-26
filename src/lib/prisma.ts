import { PrismaClient } from '@prisma/client';

/**
 * Client Prisma singolo.
 * In sviluppo Next ricarica i moduli a ogni modifica: senza questa cache si
 * aprirebbero decine di connessioni al database.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
