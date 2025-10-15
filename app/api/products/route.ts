// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The function MUST be exported and named GET
export async function GET() { 
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('FETCH_PRODUCTS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}