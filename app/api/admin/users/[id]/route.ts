// app/api/admin/users/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// DELETE a user (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id || session.user.role !== Role.admin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userIdToDelete = params.id;

  // Safety check: an admin cannot delete their own account
  if (userIdToDelete === session.user.id) {
    return new NextResponse("You cannot delete your own account.", { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: {
        id: userIdToDelete,
      },
    });
    // Return a success response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE_USER_ERROR:', error);
    // Handle cases where the user might not exist
    return new NextResponse('User not found or could not be deleted.', { status: 404 });
  }
}