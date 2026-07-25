import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding dummy sub-admin...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const subAdmin = {
    username: 'TaskMaster',
    name: 'Sarah TaskManager',
    email: 'sarah@earnix.com',
    password: hashedPassword,
    role: 'SUB_ADMIN',
    subAdminPermissions: ['UPLOAD_TASKS', 'APPROVE_WITHDRAWALS']
  };

  const exists = await prisma.user.findUnique({ where: { email: subAdmin.email } });
  
  if (!exists) {
    await prisma.user.create({ data: subAdmin as any });
    console.log('Created sub-admin:', subAdmin.username);
  } else {
    console.log('Sub-admin already exists');
  }

  console.log('Finished seeding sub-admin.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
