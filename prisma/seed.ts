import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to initialize the database with default data
 * Run with: npx prisma db seed
 */
async function main() {
  console.log('🌱 Seeding database...');

  // Create default API keys for development
  const devKeys = [
    { key: 'dev-api-key-12345', name: 'Development Key' },
    { key: 'artist-key-67890', name: 'Test Artist Key' },
  ];

  for (const keyData of devKeys) {
    const existing = await prisma.apiKey.findUnique({
      where: { key: keyData.key },
    });

    if (!existing) {
      await prisma.apiKey.create({
        data: keyData,
      });
      console.log(`  ✓ Created API key: ${keyData.name}`);
    } else {
      console.log(`  - API key already exists: ${keyData.name}`);
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
