// app/api/seller/products/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// POST: Create a new product for the logged-in seller
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // Security check: Must be logged in and a seller
  if (!session || !session.user?.id || session.user.role !== Role.seller) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, stock, category, imageUrl } = body;

    // Basic validation
    if (!name || !description || !price || !stock || !category) {
      return new NextResponse('All fields except image are required', { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        imageUrl, // Optional image URL for now
        sellerId: session.user.id,
      },
    });

    return NextResponse.json(newProduct, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('CREATE_PRODUCT_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}