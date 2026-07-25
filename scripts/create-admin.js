const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Super Admin...");
  const hashedPassword = await bcrypt.hash('Earnix@2026', 10);
  const hashedPin = await bcrypt.hash('1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'superadmin@earnix.com' },
    update: {},
    create: {
      name: 'Super Admin',
      username: 'earnix_boss',
      email: 'superadmin@earnix.com',
      password: hashedPassword,
      withdrawalPin: hashedPin,
      role: 'ADMIN',
      plan: 'PRO',
      affiliateBalance: 1000000,
      taskBalance: 500000
    }
  });

  console.log("Super Admin Created Successfully:");
  console.log("Username: earnix_boss");
  console.log("Password: Earnix@2026");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
