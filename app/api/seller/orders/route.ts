// app/api/seller/orders/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET all orders for the logged-in seller
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id || session.user.role !== Role.seller) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { sellerId: session.user.id },
      include: {
        buyer: { select: { name: true, email: true } }, // Get buyer's name
        items: { include: { product: true } }, // Get details of products in the order
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('FETCH_SELLER_ORDERS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}