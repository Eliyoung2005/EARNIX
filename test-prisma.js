const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Earnix@2026', 10);
  
  const user = await prisma.user.update({
    where: { username: 'earnixboss' },
    data: { password: hashedPassword }
  });
  console.log("Updated password for user:", user.username);
}

main().finally(() => process.exit(0));
