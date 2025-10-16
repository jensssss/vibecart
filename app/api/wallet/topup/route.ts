// app/api/wallet/topup/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, TransactionType } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    let { amount } = body;
    amount = Number(amount);

    // Validation
    if (isNaN(amount) || amount <= 0) {
      return new NextResponse('Invalid amount.', { status: 400 });
    }
    // Max top-up is 10 Million IDR as per our spec
    if (amount > 10000000) {
      return new NextResponse('Top-up amount cannot exceed 10,000,000 IDR.', { status: 400 });
    }

    // Use a transaction to ensure both operations succeed or fail together
    const [, updatedUser] = await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          amount: amount,
          type: TransactionType.TOPUP,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: {
            increment: amount,
          },
        },
      }),
    ]);

    return NextResponse.json({ newBalance: updatedUser.walletBalance });

  } catch (error) {
    console.error('TOPUP_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}