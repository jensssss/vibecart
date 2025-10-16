// app/api/seller/products/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Fetches all products for the logged-in seller
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id || session.user.role !== Role.seller) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('FETCH_SELLER_PRODUCTS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// POST: Creates a new product for the logged-in seller
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id || session.user.role !== Role.seller) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, stock, category, imageUrl } = body;

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
        imageUrl,
        sellerId: session.user.id,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('CREATE_PRODUCT_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// --- NEW: This function deletes a product ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id || session.user.role !== Role.seller) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // The 'deleteMany' ensures we also check for sellerId for security
    await prisma.product.deleteMany({
      where: {
        id: params.id,
        sellerId: session.user.id, // Security: Ensure seller owns this product
      },
    });
    // Return a success response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE_PRODUCT_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}