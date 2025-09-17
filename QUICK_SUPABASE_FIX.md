# 🚀 QUICK FIX: Supabase Connection Issue

## ❌ Current Problem
Your Vercel deployment can't connect to Supabase database:
```
Can't reach database server at `db.muqjzdekfjbxsykumfad.supabase.co:5432`
```

## ✅ Solution: Update Connection String

### Step 1: Get Correct Supabase Connection String

1. **Go to your Supabase project dashboard**
2. **Settings** → **Database** 
3. **Scroll down to "Connection parameters"**
4. **Copy the "URI" connection string** (NOT the pooled connection)

It should look like:
```
postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Step 2: Update Vercel Environment Variable

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click your Vitae project**
3. **Settings** → **Environment Variables**
4. **Find `DATABASE_URL`**
5. **Edit it** and paste the new connection string
6. **Save changes**

### Step 3: Trigger Redeploy

**Option A:** Push any small change to trigger redeploy
**Option B:** Go to Vercel Dashboard → Deployments → Click "Redeploy" on latest

---

## 🆘 Alternative: Use SQLite (Quick Fix)

If Supabase still doesn't work, temporarily switch back to SQLite:

**In Vercel Environment Variables, change:**
```
DATABASE_URL=file:./dev.db
```

This will work immediately but won't persist data between deployments.

---

## 🧪 Test After Fix

1. **Wait 2 minutes for redeploy**
2. **Try signup again**
3. **Should see our debug logs in Vercel function logs**
4. **If still fails, check Vercel function logs for exact error**

---

## 🔍 Common Connection String Issues

❌ **Wrong format:**
```
postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

✅ **Correct format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Make sure:**
- Password is URL-encoded if it contains special characters
- Project reference matches your actual Supabase project
- Using port 5432 (not 6543 pooled connection)
