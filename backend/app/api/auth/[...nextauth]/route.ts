import NextAuth from 'next-auth';
import { authOptions } from '../../../../src/lib/auth';

/**
 * PUBLIC_INTERFACE
 * GET
 * NextAuth GET handler for authentication routes.
 * Note: This file follows Next.js App Router conventions.
 */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
