// app/api/seller/products/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// --- GET and PUT functions from before (unchanged) ---
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ... existing GET code ...
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ... existing PUT code ...
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