import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is properly formatted for SQLite
const databaseUrl = process.env.DATABASE_URL?.startsWith('postgresql://') 
  ? 'file:./dev.db' 
  : process.env.DATABASE_URL || 'file:./dev.db';

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
