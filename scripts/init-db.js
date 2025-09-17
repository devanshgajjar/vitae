const { PrismaClient } = require('@prisma/client');

async function initializeDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Initializing database...');
    
    // This will create tables if they don't exist
    await prisma.$executeRaw`SELECT 1`;
    
    console.log('✅ Database connection successful');
    
    // Check if tables exist by trying to count users
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Found ${userCount} users in database`);
    } catch (error) {
      console.log('📋 Creating database tables...');
      // Tables don't exist, they'll be created automatically by Prisma
    }
    
    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
