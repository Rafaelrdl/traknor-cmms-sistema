import { PrismaClient } from '@prisma/client';
import { config } from './index';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances during development hot reloading
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: config.nodeEnv === 'development' ? ['query'] : ['error'],
  });

if (config.nodeEnv !== 'production') globalThis.__prisma = prisma;

export default prisma;