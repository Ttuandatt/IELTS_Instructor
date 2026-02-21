import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../shared/entities';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User],
    synchronize: false,
  });

  await ds.initialize();
  const repo = ds.getRepository(User);

  const email = (process.env.ADMIN_EMAIL || 'admin@ieltshelper.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const exists = await repo.findOne({ where: { email } });
  if (exists) {
    console.log(`✅ Admin user already exists: ${email}`);
    await ds.destroy();
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const admin = repo.create({
    email,
    password_hash,
    display_name: 'Admin',
    role: UserRole.ADMIN,
  });

  await repo.save(admin);
  console.log(`✅ Admin user created: ${email}`);
  await ds.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
