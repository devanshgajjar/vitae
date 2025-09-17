# Vercel Environment Variables Setup

To make your Vitae app work on Vercel, you need to add these environment variables in your Vercel dashboard:

## 🌐 Required Environment Variables

Go to your Vercel project dashboard → Settings → Environment Variables and add:

### 1. Database (SQLite - No external setup required)
```
DATABASE_URL = file:./dev.db
```

### 2. NextAuth Secret (Required for authentication)
```
NEXTAUTH_SECRET = your-super-secret-key-for-production-change-this
```

### 3. NextAuth URL (Your Vercel domain)
```
NEXTAUTH_URL = https://your-project-name.vercel.app
```

### 4. OpenAI API Key (For AI features)
```
OPENAI_API_KEY = your-openai-api-key-here
```

### 5. Application URLs
```
NEXT_PUBLIC_APP_URL = https://your-project-name.vercel.app
NEXT_PUBLIC_BASE_URL = https://your-project-name.vercel.app
```

## 🚀 Quick Setup Steps

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project** (vitae or similar name)
3. **Click Settings** → **Environment Variables**
4. **Add each variable above** (set Environment to "All")
5. **Redeploy** your project

## ✅ After Setup

Your app will have:
- ✅ Email/password authentication working
- ✅ SQLite database (no external DB needed)
- ✅ AI-powered resume generation
- ✅ 5 profiles per user limit
- ✅ PDF/DOCX export functionality

No Supabase or external database setup required!
