require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true }
  });
  console.log("All users in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
