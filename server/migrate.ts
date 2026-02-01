import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load .env without validation
config();

async function runMigrations() {
  console.log('⏳ Running migrations...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  // Use max 1 connection for migrations
  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations completed successfully');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await client.end();
    process.exit(1);
  }
}

runMigrations();
