// Test setup file
import { PrismaClient } from '@prisma/client';

// Mock Prisma for tests
jest.mock('@/config/database', () => ({
  __esModule: true,
  default: new PrismaClient(),
}));

// Increase test timeout for database operations
jest.setTimeout(30000);