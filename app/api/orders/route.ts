// app/api/orders/route.ts

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

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { addressId } = body;

    if (!addressId) {
      return new NextResponse('Shipping address is required.', { status: 400 });
    }

    // 1. Get all items from the user's cart, including product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return new NextResponse('Your cart is empty.', { status: 400 });
    }

    // 2. Calculate the total price and group items by seller
    let totalPrice = 0;
    const itemsBySeller = new Map<string, any[]>();

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return new NextResponse(`Not enough stock for ${item.product.name}.`, { status: 400 });
      }
      totalPrice += Number(item.product.price) * item.quantity;
      
      const sellerId = item.product.sellerId;
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId)?.push(item);
    }
    
    // 3. Check if user has enough balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.walletBalance < totalPrice) {
      return new NextResponse('Insufficient wallet balance.', { status: 400 });
    }

    // 4. Execute the transaction
    const createdOrders = await prisma.$transaction(async (tx) => {
      // Deduct user's wallet balance
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: totalPrice } },
      });

      // Log the purchase transaction
      await tx.walletTransaction.create({
        data: {
            userId: userId,
            amount: -totalPrice,
            type: TransactionType.PURCHASE
        }
      });

      const orders = [];
      // Create a separate order for each seller
      for (const [sellerId, items] of itemsBySeller.entries()) {
        let sellerTotalPrice = 0;
        items.forEach(item => sellerTotalPrice += Number(item.product.price) * item.quantity);

        const order = await tx.order.create({
          data: {
            buyerId: userId,
            sellerId: sellerId,
            addressId: addressId,
            totalAmount: sellerTotalPrice,
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
        });
        orders.push(order);
      
        // Update stock for each item
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 5. Clear the user's cart
      await tx.cartItem.deleteMany({ where: { userId } });
      
      return orders;
    });

    return NextResponse.json(createdOrders, { status: 201 });

  } catch (error: any) {
    console.error('PLACE_ORDER_ERROR:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}