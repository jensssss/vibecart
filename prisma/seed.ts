// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting advanced seeding...');

  // --- 1. Clean Slate ---
  // For safety, let's not delete the main admin account if it exists
  const adminEmail = 'your-admin-email@example.com'; // ⚠️ IMPORTANT: Change this to your admin email!

  console.log('🧹 Clearing old products and non-admin users...');
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        not: adminEmail,
      },
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10); // Generic password for all seeded users

  // --- 2. Create Sellers and Their Products ---
  console.log('Creating 5 sellers with products...');
  for (let i = 0; i < 5; i++) {
    const sellerName = faker.company.name();
    const seller = await prisma.user.create({
      data: {
        name: sellerName,
        email: faker.internet.email({ firstName: sellerName.split(' ')[0] }).toLowerCase(),
        passwordHash,
        role: Role.seller,
        walletBalance: faker.finance.amount({ min: 1000000, max: 5000000, dec: 0 }),
      },
    });

    // Create 3 to 7 products for each seller
    const productCount = faker.number.int({ min: 3, max: 7 });
    for (let j = 0; j < productCount; j++) {
      await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price({ min: 50000, max: 2000000, dec: 0 }),
          stock: faker.number.int({ min: 10, max: 100 }),
          category: faker.commerce.department(),
          imageUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/300`, // Random placeholder image
          sellerId: seller.id, // Link product to the seller
        },
      });
    }
  }

  // --- 3. Create Buyers ---
  console.log('Creating 10 buyers...');
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        passwordHash,
        role: Role.user,
        walletBalance: faker.finance.amount({ min: 500000, max: 3000000, dec: 0 }),
      },
    });
  }

  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });