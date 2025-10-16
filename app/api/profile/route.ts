// app/api/profile/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Fetch profile data (including wallet balance) for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        walletBalance: true,
      },
    });

    if (!userProfile) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('FETCH_PROFILE_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}