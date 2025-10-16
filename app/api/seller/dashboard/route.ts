// app/api/seller/dashboard/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // Security check: Must be logged in and have the 'seller' role
  if (!session || !session.user?.id || session.user.role !== Role.seller) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const sellerId = session.user.id;

  try {
    // We can fetch all the data in parallel for efficiency
    const [totalRevenueResult, totalOrders, productsSoldCount] = await Promise.all([
      // Calculate sum of all completed orders
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          sellerId: sellerId,
          status: 'DELIVERED', // Only count delivered orders for revenue
        },
      }),
      // Count total number of orders
      prisma.order.count({
        where: { sellerId: sellerId },
      }),
      // Count total number of products listed by the seller
      prisma.product.count({
        where: { sellerId: sellerId },
      }),
    ]);

    const stats = {
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      totalOrders: totalOrders,
      productsSold: productsSoldCount, // For MVP, we'll count total products listed. Can be refined later.
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('FETCH_SELLER_STATS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}