/**
 * Import data from exported JSON files to Supabase PostgreSQL
 * Run with: npx tsx scripts/import-to-supabase.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import * as schema from '../shared/schema';

config();

// Import order matters due to foreign key constraints
const IMPORT_ORDER = [
  'users',
  'categories',
  'provider_profiles',
  'services',
  'bookings',
  'reviews',
  'conversations',
  'messages',
  'favorites',
  'reports',
  // Skip sessions - not needed for Supabase Auth
];

const TABLE_MAP: Record<string, any> = {
  users: schema.users,
  categories: schema.categories,
  provider_profiles: schema.providerProfiles,
  services: schema.services,
  bookings: schema.bookings,
  reviews: schema.reviews,
  conversations: schema.conversations,
  messages: schema.messages,
  favorites: schema.favorites,
  reports: schema.reports,
};

async function importData() {
  console.log('🚀 Starting Supabase data import...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  // Find the most recent export directory
  const exportsDir = './scripts/exports';
  if (!existsSync(exportsDir)) {
    console.error('❌ Exports directory not found');
    process.exit(1);
  }

  const exportDirs = readdirSync(exportsDir)
    .filter(d => d.startsWith('neon-export-'))
    .sort()
    .reverse();

  if (exportDirs.length === 0) {
    console.error('❌ No export directories found');
    process.exit(1);
  }

  const exportPath = join(exportsDir, exportDirs[0]);
  console.log(`📁 Using export: ${exportPath}\n`);

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  const importSummary: Record<string, { success: number; failed: number }> = {};

  try {
    for (const tableName of IMPORT_ORDER) {
      const filePath = join(exportPath, `${tableName}.json`);

      if (!existsSync(filePath)) {
        console.log(`⏭️  Skipping ${tableName} (no export file)`);
        continue;
      }

      console.log(`📦 Importing ${tableName}...`);

      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      const table = TABLE_MAP[tableName];

      if (!table) {
        console.log(`   ⚠️  Unknown table: ${tableName}`);
        continue;
      }

      if (data.length === 0) {
        console.log(`   ⏭️  No records to import`);
        importSummary[tableName] = { success: 0, failed: 0 };
        continue;
      }

      let successCount = 0;
      let failedCount = 0;

      // Import records one by one to handle errors gracefully
      for (const record of data) {
        try {
          // Convert date strings back to Date objects
          const processedRecord = processRecord(record, tableName);

          await db.insert(table).values(processedRecord).onConflictDoNothing();
          successCount++;
        } catch (error: any) {
          failedCount++;
          if (failedCount <= 3) {
            console.log(`   ⚠️  Error importing record: ${error.message}`);
          }
        }
      }

      importSummary[tableName] = { success: successCount, failed: failedCount };
      console.log(`   ✅ ${successCount} imported, ${failedCount} failed`);
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary:');
    console.log('='.repeat(50));

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const [table, counts] of Object.entries(importSummary)) {
      console.log(`   ${table}: ${counts.success} imported, ${counts.failed} failed`);
      totalSuccess += counts.success;
      totalFailed += counts.failed;
    }

    console.log('='.repeat(50));
    console.log(`   Total: ${totalSuccess} imported, ${totalFailed} failed`);
    console.log('='.repeat(50));

    console.log('\n✅ Import completed!');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    await client.end();
    process.exit(1);
  }
}

function processRecord(record: any, tableName: string): any {
  const processed = { ...record };

  // Convert date strings to Date objects
  const dateFields = ['createdAt', 'updatedAt', 'expire', 'scheduledDate', 'completedDate', 'lastMessageAt'];

  for (const field of dateFields) {
    if (processed[field] && typeof processed[field] === 'string') {
      processed[field] = new Date(processed[field]);
    }
  }

  // Handle null values for optional fields
  if (tableName === 'users' && processed.supabaseId === undefined) {
    processed.supabaseId = null;
  }

  return processed;
}

importData();
