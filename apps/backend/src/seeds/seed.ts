import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

async function seed() {
  const prisma = new PrismaClient();

  try {
    const email = (process.env.ADMIN_EMAIL || 'admin@ieltshelper.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin1234!';

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      console.log(`✅ Admin user already exists: ${email}`);
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        password_hash,
        display_name: 'Admin',
        role: UserRole.admin,
      },
    });

    console.log(`✅ Admin user created: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
