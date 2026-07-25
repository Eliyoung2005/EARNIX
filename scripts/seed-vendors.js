const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy vendors...');
  
  const vendors = [
    { username: 'CodeMasterX', email: 'vendor1@earnix.com', password: 'hashedpassword', role: 'VENDOR' },
    { username: 'AlphaCodes', email: 'vendor2@earnix.com', password: 'hashedpassword', role: 'VENDOR' },
    { username: 'NinjaVendor', email: 'vendor3@earnix.com', password: 'hashedpassword', role: 'VENDOR' }
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
