# 🔧 VERCEL ENVIRONMENT VARIABLE UPDATE

## ❌ Current Issue
Your Vercel deployment is still trying to connect to the old Supabase database:
`db.muqjzdekfjbxsykumfad.supabase.co:5432`

## ✅ IMMEDIATE FIX - Update Vercel Environment

### Step 1: Update DATABASE_URL in Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click your Vitae project**
3. **Settings** → **Environment Variables**
4. **Find `DATABASE_URL`**
5. **Edit and replace with:**
   ```
   file:./dev.db
   ```
6. **Save changes**

### Step 2: Trigger Redeploy

**Option A:** Push any small change
**Option B:** Go to Vercel Dashboard → Deployments → "Redeploy" latest

---

## 🎯 Alternative: Proper Supabase Setup

If you want to use your current Supabase project properly:

### Get Connection String from Current Supabase:

1. **Go to your Supabase project** (vitae-ai-production)
2. **Settings** → **Database**
3. **Connection Parameters**
4. **Copy the URI connection string**

Should look like:
```
postgresql://postgres:[PASSWORD]@db.[NEW_PROJECT_REF].supabase.co:5432/postgres
```

### Update Vercel:
Replace `DATABASE_URL` with the new connection string.

---

## 🔄 What Happens After Fix

✅ **With SQLite** (`file:./dev.db`):
- Signup works immediately
- No external dependencies
- Data resets on redeployment

✅ **With Correct Supabase**:
- Persistent data storage
- Shared across deployments
- Better for production

---

## ⚡ QUICK ACTION NEEDED

**Just update the Vercel environment variable to:**
```
DATABASE_URL=file:./dev.db
```

**This will fix signup in 2 minutes!**
