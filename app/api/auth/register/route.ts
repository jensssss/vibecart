// app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Validate the input
    if (!name || !email || !password) {
      return new NextResponse('Missing name, email, or password', { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return new NextResponse('User with this email already exists', { status: 409 }); // 409 Conflict
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword, // Use passwordHash to match our schema
      },
    });

    // 5. Return a success response (don't send the password back)
    return NextResponse.json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
    }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('REGISTRATION_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}