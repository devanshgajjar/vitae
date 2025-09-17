# Supabase Setup for Vitae AI

This guide will help you set up Supabase as the production database for your Vitae AI application.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `vitae-ai-production`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### 2. Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection Parameters**
3. Copy the **URI** connection string
4. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 3. Update Environment Variables

Add these to your **Vercel Environment Variables** (and `.env.local` for local development):

```bash
# Replace with your Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Optional: Supabase API credentials (for future features)
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 4. Run Database Migration

The app will automatically create tables on first deployment. No additional setup needed!

## 🔧 For Local Development

If you want to test with Supabase locally:

1. Update your `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

2. Run migration:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🎯 Benefits of Supabase

✅ **Reliable PostgreSQL database**  
✅ **Automatic backups**  
✅ **Scalable infrastructure**  
✅ **Real-time capabilities** (for future features)  
✅ **Built-in authentication** (if needed later)  
✅ **Free tier with generous limits**  

## 🛟 Troubleshooting

**Connection Issues:**
- Ensure your password doesn't contain special characters that need URL encoding
- Check that your IP is not restricted (Supabase allows all IPs by default)
- Verify the connection string format is correct

**Migration Issues:**
- Run `npx prisma generate` first
- Then run `npx prisma db push` to create tables
- Check Vercel deployment logs for any database errors

## 📊 Monitoring

- Monitor your database usage in the Supabase dashboard
- Free tier includes:
  - 2 projects
  - 500MB database storage  
  - 2GB bandwidth
  - 50MB file storage

Perfect for Vitae AI's needs!
