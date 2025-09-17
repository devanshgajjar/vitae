-- Vitae AI Database Schema for Supabase (PostgreSQL)

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS public."User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts table (for authentication providers)
CREATE TABLE IF NOT EXISTS public."Account" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
);

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS public."Session" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS public."VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);

-- Profiles table (user profile data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Default Profile',
    header JSONB NOT NULL,
    experience JSONB NOT NULL,
    education JSONB NOT NULL,
    skills JSONB NOT NULL,
    projects JSONB NOT NULL,
    evidence JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document kinds enum
CREATE TYPE public."DocumentKind" AS ENUM ('resume', 'cover_letter', 'linkedin_summary');

-- Documents table (generated resumes/cover letters)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kind public."DocumentKind" NOT NULL,
    jd_hash TEXT NOT NULL,
    content_md TEXT NOT NULL,
    trace_mapping JSONB NOT NULL,
    options JSONB NOT NULL,
    fit_analysis JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document versions table
CREATE TABLE IF NOT EXISTS public.document_versions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content_md TEXT NOT NULL,
    changes_summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

-- Job description cache table
CREATE TABLE IF NOT EXISTS public.jd_cache (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    jd_hash TEXT UNIQUE NOT NULL,
    parsed_data JSONB NOT NULL,
    fit_analyses JSONB NOT NULL,
    access_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON public."User"(email);
CREATE INDEX IF NOT EXISTS idx_account_user ON public."Account"("userId");
CREATE INDEX IF NOT EXISTS idx_session_user ON public."Session"("userId");
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_profile ON public.documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_jd_cache_hash ON public.jd_cache(jd_hash);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_cache ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your needs)
CREATE POLICY "Users can view own data" ON public."User"
    FOR ALL USING (auth.uid()::text = id);

CREATE POLICY "Users can manage own accounts" ON public."Account"
    FOR ALL USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage own sessions" ON public."Session"
    FOR ALL USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage own profiles" ON public.profiles
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own documents" ON public.documents
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own document versions" ON public.document_versions
    FOR ALL USING (auth.uid()::text = (SELECT user_id FROM public.documents WHERE id = document_id));

-- Allow public access to JD cache for performance
CREATE POLICY "Public read access to JD cache" ON public.jd_cache
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage JD cache" ON public.jd_cache
    FOR ALL USING (auth.role() = 'authenticated');
