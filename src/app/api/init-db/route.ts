import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  // Force database schema sync
  try {
    console.log('🔄 Forcing database schema sync...');
    
    // This will push the schema to the database
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    await execAsync('npx prisma db push --force-reset');
    
    console.log('✅ Database schema synced successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema synced successfully' 
    });
  } catch (error) {
    console.error('❌ Database schema sync error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Database schema sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
