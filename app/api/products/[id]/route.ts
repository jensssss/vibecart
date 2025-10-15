// app/api/products/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The 'params' object contains the dynamic route parameters, in this case, the 'id'
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      // Optionally, include seller info
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('FETCH_SINGLE_PRODUCT_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}