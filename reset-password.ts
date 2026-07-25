import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('camix@2026', 10);
  await prisma.user.update({
    where: { username: 'earnixboss' },
    data: { password: hashedPassword }
  });
  console.log("Password reset successfully");
}

main();
