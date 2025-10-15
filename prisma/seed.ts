// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create two seller accounts
  const passwordHash = await bcrypt.hash('password123', 10);

  const seller1 = await prisma.user.create({
    data: {
      name: 'Gadget Grove',
      email: 'seller1@vibecart.com',
      passwordHash,
      role: Role.seller,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: 'Fashion Forward',
      email: 'seller2@vibecart.com',
      passwordHash,
      role: Role.seller,
    },
  });

  console.log('Created sellers:', { seller1, seller2 });

  // 2. Create some products for them
  const products = [
    { name: 'VibePod Max', description: 'Premium wireless headphones', price: 349.99, stock: 50, category: 'Electronics', imageUrl: 'https://via.placeholder.com/300', sellerId: seller1.id },
    { name: 'Quantum Laptop', description: 'Ultra-thin and powerful', price: 1299.99, stock: 25, category: 'Electronics', imageUrl: 'https://via.placeholder.com/300', sellerId: seller1.id },
    { name: 'Minimalist Tee', description: '100% organic cotton t-shirt', price: 29.99, stock: 200, category: 'Apparel', imageUrl: 'https://via.placeholder.com/300', sellerId: seller2.id },
    { name: 'Urban Explorer Jacket', description: 'Waterproof and stylish', price: 149.99, stock: 75, category: 'Apparel', imageUrl: 'https://via.placeholder.com/300', sellerId: seller2.id },
    { name: 'Smart Hydro Flask', description: 'Keeps drinks cold for 24 hours', price: 39.99, stock: 150, category: 'Accessories', imageUrl: 'https://via.placeholder.com/300', sellerId: seller1.id },
    { name: 'Classic Leather Watch', description: 'Timeless design, modern feel', price: 199.99, stock: 60, category: 'Accessories', imageUrl: 'https://via.placeholder.com/300', sellerId: seller2.id },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });