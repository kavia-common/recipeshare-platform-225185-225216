import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../../../../src/lib/prisma';

/**
 * PUBLIC_INTERFACE
 * POST
 * Signup endpoint
 * Body: { name?: string, email: string, password: string }
 * Returns: 201 with created user id and email, or appropriate error codes.
 */
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').transform((e) => e.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = signupSchema.safeParse(json);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      return NextResponse.json({ error: 'Validation error', issues }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await (prisma as any).user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await (prisma as any).user.create({
      data: { name: name ?? null, email, password: hash },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    // Avoid leaking details
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
