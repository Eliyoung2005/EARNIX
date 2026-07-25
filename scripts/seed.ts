import { prisma } from '../src/lib/prisma';
import { Role } from '@prisma/client';

async function main() {
  console.log('Seeding dummy vendors...');
  
  const vendors = [
    { username: 'CodeMasterX', name: 'Code Master', email: 'vendor1@earnix.com', password: 'hashedpassword', role: Role.VENDOR },
    { username: 'AlphaCodes', name: 'Alpha Codes', email: 'vendor2@earnix.com', password: 'hashedpassword', role: Role.VENDOR },
    { username: 'NinjaVendor', name: 'Ninja Vendor', email: 'vendor3@earnix.com', password: 'hashedpassword', role: Role.VENDOR }
  ];

  for (const v of vendors) {
    const exists = await prisma.user.findUnique({ where: { email: v.email } });
    if (!exists) {
      await prisma.user.create({ data: v });
      console.log('Created vendor:', v.username);
    } else {
      console.log('Vendor already exists:', v.username);
    }
  }

  console.log('Finished seeding vendors.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
