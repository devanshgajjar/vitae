# Vercel Deployment Guide

This guide covers deploying your Vitae AI Resume Builder to Vercel with full authentication and PostgreSQL database.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Google/GitHub OAuth Apps**: For authentication (optional but recommended)

## Step 1: Database Setup (Vercel Postgres)

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Create a new project or go to existing project
3. Navigate to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Choose your database name and region
6. Copy the connection details

### Option B: External PostgreSQL

You can also use:
- **Supabase**: Free PostgreSQL with dashboard
- **PlanetScale**: MySQL alternative with generous free tier
- **Railway**: Simple PostgreSQL hosting
- **Neon**: Serverless PostgreSQL

## Step 2: Environment Variables

Set these environment variables in Vercel dashboard under **Settings** → **Environment Variables**:

### Required Variables

```bash
# Database
DATABASE_URL="postgres://default:password@host:5432/verceldb?sslmode=require"

# NextAuth.js (Generate a random secret)
NEXTAUTH_SECRET="your-super-secret-key-32-chars-min"
NEXTAUTH_URL="https://your-app.vercel.app"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"
```

### Optional OAuth Variables

```bash
# Google OAuth (if you want Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (if you want GitHub sign-in)
GITHUB_ID="your-github-app-client-id"
GITHUB_SECRET="your-github-app-client-secret"
```

## Step 3: OAuth Setup (Optional)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

### GitHub OAuth Setup

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Set Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`

## Step 4: Deployment

### Deploy to Vercel

1. **Connect Repository**:
   - Go to Vercel dashboard
   - Click **New Project**
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Deploy**:
   - Click **Deploy**
   - Wait for build to complete

### Database Migration

After deployment, you need to set up your database:

1. **Install Vercel CLI** (if not already):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Run Database Migration**:
   ```bash
   # From your local project directory
   vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma generate
   ```

   Or run this in Vercel's environment:
   ```bash
   vercel exec -- npx prisma migrate deploy
   ```

## Step 5: Testing

### Test Your Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test authentication**:
   - Try signing in with Google/GitHub (if configured)
   - Or use demo mode by going to `/create`
3. **Test core features**:
   - Create a profile
   - Generate a resume
   - Export documents

### Verify User Limits

1. Sign in with a user account
2. Try creating more than 5 profiles
3. Should see: "Maximum of 5 profiles allowed"

## Step 6: Production Optimization

### Performance

1. **Enable Analytics** in Vercel dashboard
2. **Set up monitoring** for API routes
3. **Configure caching** for static assets

### Security

1. **Rotate secrets** regularly
2. **Monitor OAuth usage**
3. **Set up error logging**

### Database

1. **Set up database backups**
2. **Monitor connection limits**
3. **Consider read replicas** for scale

## Common Issues & Solutions

### Build Errors

**Error**: "NEXTAUTH_SECRET is not defined"
- **Solution**: Add NEXTAUTH_SECRET environment variable

**Error**: "Database connection failed"
- **Solution**: Check DATABASE_URL format and permissions

### Authentication Issues

**Error**: "OAuth configuration error"
- **Solution**: Verify OAuth redirect URIs match deployment URL

**Error**: "Provider not found"
- **Solution**: Ensure OAuth environment variables are set

### Database Issues

**Error**: "Migration failed"
- **Solution**: Run `npx prisma migrate reset` and redeploy

**Error**: "Connection pool exhausted"
- **Solution**: Add `?connection_limit=10` to DATABASE_URL

## Monitoring & Maintenance

### Health Checks

Monitor these endpoints:
- `/api/auth/session` - Authentication health
- `/api/profiles` - Database connectivity
- `/` - Application availability

### Database Maintenance

```sql
-- Check profile counts per user
SELECT user_id, COUNT(*) as profile_count 
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 5;

-- Clean up old documents (optional)
DELETE FROM documents 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Performance Monitoring

Use Vercel's built-in analytics:
- **Function Duration**: Monitor API response times
- **Error Rate**: Track failed requests
- **Usage**: Monitor user activity

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test database connection
4. Verify OAuth configuration

Your Vitae AI Resume Builder is now ready for production use with full authentication and user management! 🚀
