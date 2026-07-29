const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUB_ADMIN'] } },
    select: { id: true, username: true, email: true, role: true }
  });
  console.log('Admin/Staff users:', JSON.stringify(admins, null, 2));

  // Also check earnixboss
  const boss = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'earnixboss' },
        { email: 'superadmin@earnix.com' }
      ]
    },
    select: { id: true, username: true, email: true, role: true, password: true }
  });
  console.log('\nSuperadmin user:', JSON.stringify(boss ? { ...boss, password: boss.password ? '[SET]' : '[MISSING]' } : null, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
