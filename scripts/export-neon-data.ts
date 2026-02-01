/**
 * Export all data from Neon.db to JSON files
 * Run with: npx tsx scripts/export-neon-data.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { config } from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import * as schema from '../shared/schema';

config();

neonConfig.webSocketConstructor = ws;

async function exportData() {
  console.log('🚀 Starting Neon.db data export...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  // Create exports directory
  const exportDir = './scripts/exports';
  if (!existsSync(exportDir)) {
    mkdirSync(exportDir, { recursive: true });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = `${exportDir}/neon-export-${timestamp}`;
  mkdirSync(exportPath, { recursive: true });

  try {
    // Export each table
    const tables = [
      { name: 'users', table: schema.users },
      { name: 'provider_profiles', table: schema.providerProfiles },
      { name: 'categories', table: schema.categories },
      { name: 'services', table: schema.services },
      { name: 'bookings', table: schema.bookings },
      { name: 'reviews', table: schema.reviews },
      { name: 'conversations', table: schema.conversations },
      { name: 'messages', table: schema.messages },
      { name: 'favorites', table: schema.favorites },
      { name: 'reports', table: schema.reports },
      { name: 'sessions', table: schema.sessions },
    ];

    const exportSummary: Record<string, number> = {};

    for (const { name, table } of tables) {
      console.log(`📦 Exporting ${name}...`);

      try {
        const data = await db.select().from(table);
        exportSummary[name] = data.length;

        writeFileSync(
          `${exportPath}/${name}.json`,
          JSON.stringify(data, null, 2)
        );

        console.log(`   ✅ ${data.length} records exported`);
      } catch (error: any) {
        console.log(`   ⚠️  Error exporting ${name}: ${error.message}`);
        exportSummary[name] = 0;
      }
    }

    // Create summary file
    const summary = {
      exportDate: new Date().toISOString(),
      source: 'Neon.db',
      tables: exportSummary,
      totalRecords: Object.values(exportSummary).reduce((a, b) => a + b, 0),
    };

    writeFileSync(
      `${exportPath}/export-summary.json`,
      JSON.stringify(summary, null, 2)
    );

    console.log('\n' + '='.repeat(50));
    console.log('📊 Export Summary:');
    console.log('='.repeat(50));

    for (const [table, count] of Object.entries(exportSummary)) {
      console.log(`   ${table}: ${count} records`);
    }

    console.log('='.repeat(50));
    console.log(`   Total: ${summary.totalRecords} records`);
    console.log('='.repeat(50));

    console.log(`\n✅ Export completed successfully!`);
    console.log(`📁 Files saved to: ${exportPath}`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    await pool.end();
    process.exit(1);
  }
}

exportData();
