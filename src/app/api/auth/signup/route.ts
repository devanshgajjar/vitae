import { NextRequest, NextResponse } from 'next/server';
import { createUser, createJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Signup API called');
    const { email, password, name } = await request.json();
    console.log('📧 Signup attempt for email:', email);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking if user exists...');
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    console.log('👤 Creating new user...');
    const user = await createUser(email, password, name);
    const token = await createJWT(user);

    const response = NextResponse.json({ 
      user: { id: user.id, email: user.email, name: user.name },
      success: true 
    });

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
