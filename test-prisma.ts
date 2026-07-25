import { prisma } from './src/lib/prisma';

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'earnix_boss' },
        { username: 'earnix_boss' }
      ]
    }
  });
  console.log("Found user:", user);
}

main().finally(() => process.exit(0));
