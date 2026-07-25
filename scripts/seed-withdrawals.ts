import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding dummy withdrawals...');
  
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found to assign withdrawals to.');
    return;
  }

  // Create 3 dummy withdrawals
  await prisma.withdrawalRequest.createMany({
    data: [
      { userId: user.id, amount: 5000, type: 'AFFILIATE', status: 'PENDING' },
      { userId: user.id, amount: 12000, type: 'TASK', status: 'PENDING' },
      { userId: user.id, amount: 2500, type: 'AFFILIATE', status: 'PENDING' },
    ]
  });

  console.log('Finished seeding withdrawals.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
