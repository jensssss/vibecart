// app/api/auth/[...nextauth]/route.ts (Simplified)

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // <-- Import from our new central file

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };