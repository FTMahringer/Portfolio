import { db } from './index';
import { users } from './schema';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password);

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing.length > 0) {
    await db.update(users).set({ passwordHash }).where(eq(users.email, email));
    console.log(`Updated password hash for ${email}`);
  } else {
    await db.insert(users).values({ email, passwordHash, createdAt: Math.floor(Date.now() / 1000) });
    console.log(`Created admin user: ${email}`);
  }
}

seed().catch(console.error);
