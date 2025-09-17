// Simple authentication system
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production'
);

export interface User {
  id: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  console.log('🔐 Hashing password...');
  const hashedPassword = await hashPassword(password);
  
  console.log('💾 Creating user in database...');
  const user = await prisma.user.create({
    data: {
      email,
      name: name || email.split('@')[0],
      accounts: {
        create: {
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: email,
          access_token: hashedPassword,
        }
      }
    }
  });

  console.log('✅ User created successfully:', user.id);
  return {
    id: user.id,
    email: user.email!,
    name: user.name || email.split('@')[0],
  };
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: {
          provider: 'credentials'
        }
      }
    }
  });

  if (!user || !user.accounts[0]?.access_token) {
    return null;
  }

  const isValid = await verifyPassword(password, user.accounts[0].access_token);
  
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.name || email.split('@')[0],
  };
}

export async function createJWT(user: User): Promise<string> {
  return new SignJWT({ 
    sub: user.id, 
    email: user.email, 
    name: user.name 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get from cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    return match ? match[1] : null;
  }
  
  return null;
}
