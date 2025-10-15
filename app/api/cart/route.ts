// app/api/cart/route.ts (Final Corrected Version)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // <-- This is the critical line that fixes the 401 error

const prisma = new PrismaClient();

// This function gets the items from the cart
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: true,
      },
      orderBy: {
        product: {
          name: 'asc'
        }
      }
    });
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('FETCH_CART_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// This is our protected "Add to Cart" function
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      return new NextResponse('Invalid product ID or quantity', { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }
    if (product.stock < quantity) {
      return new NextResponse('Not enough stock available', { status: 400 });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    });

    let cartItem;
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return new NextResponse('Adding this quantity would exceed available stock', { status: 400 });
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    return NextResponse.json(cartItem, { status: 200 });
  } catch (error) {
    console.error('ADD_TO_CART_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}