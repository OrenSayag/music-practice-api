import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './index.js';

async function wipe() {
  console.log('Wiping database...');
  await db.execute(sql`DROP SCHEMA public CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);
  console.log('Database wiped.');
  process.exit(0);
}

wipe();
