// app/api/products/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Check for a search query parameter
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  try {
    if (query) {
      // If there's a query, perform a search
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(products);
    } else {
      // If no query, return all products (original behavior)
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('FETCH_PRODUCTS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}