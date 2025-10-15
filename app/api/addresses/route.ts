// app/api/addresses/route.ts (Corrected)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // <-- THIS IS THE FIX. Make sure it points to lib/auth

const prisma = new PrismaClient();

// GET: Fetch all addresses for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('FETCH_ADDRESSES_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: Create a new address for the logged-in user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { street, city, province, postalCode } = body;

    if (!street || !city || !province || !postalCode) {
      return new NextResponse('All address fields are required', { status: 400 });
    }

    const newAddress = await prisma.address.create({
      data: {
        street,
        city,
        province,
        postalCode,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('CREATE_ADDRESS_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}