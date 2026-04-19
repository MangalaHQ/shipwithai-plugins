-- ============================================================
-- Supabase Auth Migration
-- Supabase handles auth tables automatically (auth.users).
-- This creates your PUBLIC profiles table + RLS policies.
-- Run in Supabase SQL Editor or via migration file.
-- ============================================================

-- ──────────────────────────────────────
-- Profiles table (extends auth.users)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────
-- RLS Policies
-- ──────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for trigger fallback)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optional: Public profiles (read-only for all authenticated users)
-- CREATE POLICY "Authenticated users can view all profiles"
--   ON public.profiles
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- ──────────────────────────────────────
-- Auto-create profile on signup
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger: run after new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────
-- Auto-update updated_at
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ──────────────────────────────────────
-- Optional: Clerk/Firebase sync table
-- Use if syncing external auth to Supabase DB
-- ──────────────────────────────────────
-- CREATE TABLE IF NOT EXISTS public.external_users (
--   id TEXT PRIMARY KEY,            -- Clerk user_id or Firebase UID
--   provider TEXT NOT NULL,         -- 'clerk' or 'firebase'
--   email TEXT NOT NULL,
--   name TEXT,
--   image TEXT,
--   synced_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- ALTER TABLE public.external_users ENABLE ROW LEVEL SECURITY;
