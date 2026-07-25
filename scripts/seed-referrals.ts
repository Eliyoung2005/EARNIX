import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding top referrers data...');

  const users = await prisma.user.findMany({ take: 5 });

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    await prisma.user.update({
      where: { id: user.id },
      data: {
        referralCount: Math.floor(Math.random() * 100) + 20,
        weeklyReferralCount: Math.floor(Math.random() * 10) + 1,
        // Set one to simulate needing a reset (8 days ago)
        lastWeeklyReset: i === 0 ? new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) : new Date()
      }
    });
  }

  console.log('Referrers seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
