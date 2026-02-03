/**
 * Quick diagnostic to check database content
 * Run with: npx tsx scripts/check-db.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

config();

async function checkDatabase() {
  console.log('🔍 Checking Supabase database...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // Check services
    console.log('📦 Services:');
    const services = await db.query.services.findMany();
    console.log(`   Total: ${services.length}`);
    const activeServices = services.filter(s => s.status === 'active');
    console.log(`   Active: ${activeServices.length}`);

    if (services.length > 0) {
      console.log('\n   Sample service:');
      console.log(`   - ID: ${services[0].id}`);
      console.log(`   - Title: ${services[0].titleEn}`);
      console.log(`   - Status: ${services[0].status}`);
      console.log(`   - Provider ID: ${services[0].providerId}`);
      console.log(`   - Category ID: ${services[0].categoryId}`);
    }

    // Check provider profiles
    console.log('\n📦 Provider Profiles:');
    const providers = await db.query.providerProfiles.findMany();
    console.log(`   Total: ${providers.length}`);

    // Check if service provider IDs match
    if (services.length > 0 && providers.length > 0) {
      const providerIds = providers.map(p => p.id);
      const matchedServices = services.filter(s => providerIds.includes(s.providerId));
      console.log(`   Services with valid providers: ${matchedServices.length}/${services.length}`);
    }

    // Check categories
    console.log('\n📦 Categories:');
    const categories = await db.query.categories.findMany();
    console.log(`   Total: ${categories.length}`);
    const activeCategories = categories.filter(c => c.isActive);
    console.log(`   Active: ${activeCategories.length}`);

    // Check if service category IDs match
    if (services.length > 0 && categories.length > 0) {
      const categoryIds = categories.map(c => c.id);
      const matchedServices = services.filter(s => categoryIds.includes(s.categoryId));
      console.log(`   Services with valid categories: ${matchedServices.length}/${services.length}`);
    }

    // Check users
    console.log('\n📦 Users:');
    const users = await db.query.users.findMany();
    console.log(`   Total: ${users.length}`);

    // Test the actual query used by the browse page
    console.log('\n🔍 Testing browse query (status=active):');
    const browseResults = await db.query.services.findMany({
      where: eq(schema.services.status, 'active'),
      with: {
        provider: {
          with: {
            user: true,
          },
        },
        category: true,
      },
      limit: 20,
    });
    console.log(`   Results: ${browseResults.length}`);

    if (browseResults.length > 0) {
      console.log('\n   First result details:');
      console.log(`   - Title: ${browseResults[0].titleEn}`);
      console.log(`   - Provider: ${browseResults[0].provider?.companyName || 'N/A'}`);
      console.log(`   - Category: ${browseResults[0].category?.nameEn || 'N/A'}`);
    }

    await client.end();
    console.log('\n✅ Database check complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

checkDatabase();
