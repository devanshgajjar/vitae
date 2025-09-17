# 🚀 Production Setup Guide

## Prerequisites

You now have authentication set up! To make your Vitae application work globally with user accounts and data persistence, follow these steps:

## 1. 📧 Set Up OAuth Providers

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret

### GitHub OAuth Setup
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Create a new OAuth App with:
   - Application name: "Vitae"
   - Homepage URL: `https://your-domain.vercel.app`
   - Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`
3. Copy Client ID and Client Secret

## 2. 🗄️ Set Up Production Database

### Option A: Supabase (Recommended)
1. Go to [Supabase](https://supabase.com) and create account
2. Create new project
3. Go to Settings > Database
4. Copy connection string (replace `[YOUR-PASSWORD]` with your password)
5. Use this as your `DATABASE_URL`

### Option B: PlanetScale
1. Go to [PlanetScale](https://planetscale.com) and create account
2. Create new database
3. Create a branch (main)
4. Get connection string from "Connect" button
5. Use this as your `DATABASE_URL`

### Option C: Neon
1. Go to [Neon](https://neon.tech) and create account
2. Create new project
3. Copy connection string from dashboard
4. Use this as your `DATABASE_URL`

## 3. 📝 Update Prisma Schema for PostgreSQL

When you're ready to use PostgreSQL in production, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite
  url      = env("DATABASE_URL")
}

// In Account model, restore @db.Text for PostgreSQL:
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text  // Add back for PostgreSQL
  access_token      String? @db.Text  // Add back for PostgreSQL
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text  // Add back for PostgreSQL
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

## 4. 🔐 Configure Environment Variables

### On Vercel (Production):
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add these variables:

```bash
# Database
DATABASE_URL="your_production_database_url"

# NextAuth.js
NEXTAUTH_SECRET="your_super_secret_random_string_32_characters_or_more"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub OAuth  
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key"

# Application URLs
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 5. 🚀 Deploy to Production

1. **Push to GitHub** (already done! ✅)
2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-deploy on every push

3. **Run Database Migration**:
   ```bash
   # After deployment, run this to set up production database:
   npx prisma db push
   ```

## 6. 🎯 Test Your Global Application

1. Visit your deployed URL
2. Click "Sign In" 
3. Authenticate with Google or GitHub
4. Create a profile
5. Generate a resume
6. Verify data persists between sessions

## 7. 📊 Monitor and Scale

- **Database**: Monitor usage in your database provider dashboard
- **Authentication**: Check user sign-ups in NextAuth.js 
- **Performance**: Use Vercel Analytics
- **Errors**: Monitor in Vercel Functions tab

## 🎉 You're Live!

Your Vitae application is now globally accessible with:
- ✅ User authentication (Google/GitHub)
- ✅ Persistent user data (PostgreSQL)
- ✅ Global deployment (Vercel)
- ✅ Production-ready architecture

Users can now sign up from anywhere in the world, create profiles, and generate professional resumes with their data safely stored in the cloud!

---

## Quick Checklist
- [ ] Set up Google OAuth credentials
- [ ] Set up GitHub OAuth credentials  
- [ ] Create production database (Supabase/PlanetScale/Neon)
- [ ] Configure environment variables on Vercel
- [ ] Update Prisma schema for PostgreSQL
- [ ] Run database migration
- [ ] Test authentication flow
- [ ] Test data persistence
- [ ] Share your live app! 🚀
