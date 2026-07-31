import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
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
    update: {},
    create: {
      name: 'PRO',
      level: 2,
      price: 500,
      welcomeBonus: 100,
      dailyLoginBonus: 10,
      taskReward: 120,
      referralCommission: 250,
      isActive: true,
      description: 'Unlock higher earnings.'
    }
  });

  console.log('Created plans:', freePlan, proPlan);

  // Update any users without a plan to FREE
  const users = await prisma.user.updateMany({
    where: { planId: null },
    data: { planId: freePlan.id }
  });

  console.log(`Updated ${users.count} users without plans.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
