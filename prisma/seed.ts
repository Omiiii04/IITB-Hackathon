/**
 * prisma/seed.ts — Dev seed script for FlexHub
 *
 * Creates default admin, seller, and customer accounts for local development.
 * Run with: npm run db:seed
 *
 * Accounts created:
 *  Admin  : admin@flexhub.com  / Admin@123456
 *  Seller : seller@flexhub.com / Seller@123456
 *  Customer: customer@flexhub.com / Customer@123456
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

// Load .env.local or .env into process.env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

const prisma = new PrismaClient();

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

interface SeedUser {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@flexhub.com',
    name: 'Platform Admin',
    password: 'Admin@123456',
    role: 'ADMIN',
  },
  {
    email: 'seller@flexhub.com',
    name: 'Demo Seller',
    password: 'Seller@123456',
    role: 'SELLER',
  },
  {
    email: 'customer@flexhub.com',
    name: 'Demo Customer',
    password: 'Customer@123456',
    role: 'CUSTOMER',
  },
];

async function main() {
  console.log('🌱  Seeding FlexHub database...\n');

  for (const seedUser of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: seedUser.email } });

    if (existing) {
      console.log(`⏭️  ${seedUser.role} already exists: ${seedUser.email}`);
      continue;
    }

    const passwordHash = await hashPassword(seedUser.password);

    const user = await prisma.user.create({
      data: {
        email: seedUser.email,
        name: seedUser.name,
        passwordHash,
        role: seedUser.role,
        isEmailVerified: true,
      },
    });

    console.log(`✅  Created ${seedUser.role}: ${user.email} (id: ${user.id})`);

    // Create a demo store for the seller
    if (seedUser.role === 'SELLER') {
      const storeExists = await prisma.store.findUnique({ where: { sellerId: user.id } });
      if (!storeExists) {
        const store = await prisma.store.create({
          data: {
            sellerId: user.id,
            storeName: 'Demo Seller Store',
            slug: 'demo-seller-store',
            description: 'A demo seller store created by the seed script.',
            status: 'APPROVED',
          },
        });
        console.log(`   🏪 Created demo store: ${store.storeName} (id: ${store.id})`);
      }
    }
  }

  console.log('\n✨  Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin    → admin@flexhub.com    / Admin@123456');
  console.log('  Seller   → seller@flexhub.com   / Seller@123456');
  console.log('  Customer → customer@flexhub.com / Customer@123456');
  console.log('\nVisit:');
  console.log('  http://localhost:3000/login        (all users)');
  console.log('  http://localhost:3000/admin/dashboard    (admin only)');
  console.log('  http://localhost:3000/seller/dashboard   (seller only)');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
