import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Clearing ghost users and vendors...');
  const result = await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN'
      }
    }
  });
  console.log(`Deleted ${result.count} users/vendors.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
