// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET all users (Admin only)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // Security check: Must be logged in and have the 'admin' role
  if (!session || !session.user?.id || session.user.role !== Role.admin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      // Exclude the admin's own account from the list for safety
      where: {
        id: { not: session.user.id },
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Select only the fields we need to send to the client
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('FETCH_USERS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}