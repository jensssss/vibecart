// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // This is the core login logic
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // 1. Find the user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null; // User not found
        }

        // 2. Compare the provided password with the hashed password in the DB
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          return null; // Incorrect password
        }

        // 3. If everything is correct, return the user object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // Redirect users to /login if they try to access a protected page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };