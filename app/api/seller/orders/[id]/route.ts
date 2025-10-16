// app/api/seller/orders/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// PATCH (partially update) an order's status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id || session.user.role !== Role.seller) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    // Validate the new status
    if (!status || !Object.values(OrderStatus).includes(status)) {
        return new NextResponse('Invalid status value', { status: 400 });
    }

    const updatedOrder = await prisma.order.updateMany({
      where: {
        id: params.id,
        sellerId: session.user.id, // Security: Ensure seller owns this order
      },
      data: { status: status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('UPDATE_ORDER_STATUS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}