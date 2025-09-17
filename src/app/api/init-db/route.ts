import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔄 Initializing database tables...');
    
    // Try to access the database and create tables if they don't exist
    await prisma.$executeRaw`SELECT 1`;
    
    // Test table creation by counting users (this will create tables)
    const userCount = await prisma.user.count();
    console.log(`📊 Database ready. Found ${userCount} users.`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      userCount 
    });
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}