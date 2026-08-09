import { prisma } from '@/lib/prisma';

export const servicePlaceholder = {
  async execute() {
    return { success: true, dbReady: Boolean(prisma) };
  },
};
