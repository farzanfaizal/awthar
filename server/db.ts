import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create postgres connection
// Using standard PostgreSQL driver for Supabase compatibility
const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Export client for manual queries if needed
export { client };
