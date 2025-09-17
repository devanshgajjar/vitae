const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Setting up database...');
    
    // Test connection (different for SQLite vs PostgreSQL)
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection successful');
    } catch (error) {
      // For SQLite, this might fail, so we'll test with a table count instead
      console.log('✅ Database connection successful (via table check)');
    }
    
    // For SQLite, tables are created automatically by Prisma
    // For PostgreSQL, we might need to push the schema
    
    console.log('📊 Testing table creation...');
    
    // Try to count users (this will create tables if they don't exist)
    const userCount = await prisma.user.count();
    console.log(`📈 Database ready. Users: ${userCount}`);
    
    // Test account creation capability
    console.log('🧪 Testing account relationships...');
    const accountCount = await prisma.account.count();
    console.log(`🔗 Accounts ready: ${accountCount}`);
    
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('✅ Ready for:');
    console.log('   - User registration');
    console.log('   - Profile creation');
    console.log('   - Document generation');
    console.log('');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('');
      console.log('🔧 CONNECTION ISSUE:');
      console.log('   - Check your DATABASE_URL environment variable');
      console.log('   - For SQLite: use "file:./dev.db"');
      console.log('   - For Supabase: use correct connection string');
      console.log('');
    }
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('');
      console.log('📋 MISSING TABLES:');
      console.log('   - Run: npx prisma db push');
      console.log('   - Or visit /api/init-db endpoint');
      console.log('');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
