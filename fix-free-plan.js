const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const freePlan = await prisma.membershipPlan.findUnique({ where: { name: 'FREE' } });
  if (freePlan) {
    const updatedFeatures = freePlan.features.filter(f => !f.toLowerCase().includes('referral'));
    await prisma.membershipPlan.update({
      where: { name: 'FREE' },
      data: {
        referralCommission: 0,
        features: updatedFeatures
      }
    });
    console.log('FREE plan updated successfully.');
  } else {
    console.log('FREE plan not found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
