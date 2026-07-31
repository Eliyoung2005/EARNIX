const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

require('dotenv').config();

function getPrismaClient() {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

async function main() {
  console.log('Running EARNIX database seeder...');
  const prisma = getPrismaClient();

  try {
    // 1. Seed Membership Plans
    console.log('Seeding plans...');
    const freePlan = await prisma.membershipPlan.upsert({
      where: { name: 'FREE' },
      update: { dailyLoginBonus: 50 },
      create: {
        name: 'FREE',
        level: 1,
        price: 0,
        welcomeBonus: 50,
        dailyLoginBonus: 50,
        taskReward: 80,
        referralCommission: 250,
        isActive: true,
        description: 'Start earning immediately for free.'
      }
    });

    const proPlan = await prisma.membershipPlan.upsert({
      where: { name: 'PRO' },
      update: { dailyLoginBonus: 50 },
      create: {
        name: 'PRO',
        level: 2,
        price: 500,
        welcomeBonus: 100,
        dailyLoginBonus: 50,
        taskReward: 120,
        referralCommission: 250,
        isActive: true,
        description: 'Unlock higher earnings.'
      }
    });

    console.log('Membership plans ready: FREE, PRO');

    // 2. Ensure Superadmin account exists
    const hashedPassword = await bcrypt.hash('camix@2026', 10);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@earnix.com' },
      update: {
        role: 'ADMIN',
      },
      create: {
        name: 'EARNIX Super Admin',
        username: 'earnixboss',
        email: 'superadmin@earnix.com',
        password: hashedPassword,
        role: 'ADMIN',
        planId: freePlan.id,
      }
    });

    console.log(`Superadmin account ready: username="${superAdmin.username}", email="${superAdmin.email}"`);

    // 3. Update any unplaned users to FREE plan
    const unplaned = await prisma.user.updateMany({
      where: { planId: null },
      data: { planId: freePlan.id }
    });
    if (unplaned.count > 0) {
      console.log(`Assigned FREE plan to ${unplaned.count} existing users.`);
    }

  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});

