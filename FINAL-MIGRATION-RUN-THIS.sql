-- ===================================
-- CONTENOV COMPLETE MIGRATION
-- Run this ONCE in Supabase SQL Editor
-- ===================================

-- Add Stripe and subscription columns (safe, won't error if exist)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;

-- Add unique constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_stripe_customer_id_key') THEN
        ALTER TABLE users ADD CONSTRAINT users_stripe_customer_id_key UNIQUE (stripe_customer_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_stripe_subscription_id_key') THEN
        ALTER TABLE users ADD CONSTRAINT users_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
    END IF;
END $$;

-- Drop ALL old policies to start fresh
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own briefs" ON briefs;
DROP POLICY IF EXISTS "Users can insert their own briefs" ON briefs;
DROP POLICY IF EXISTS "Users can update their own briefs" ON briefs;
DROP POLICY IF EXISTS "Users can delete their own briefs" ON briefs;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;
DROP POLICY IF EXISTS "Service role full access users" ON users;
DROP POLICY IF EXISTS "Users can view own briefs" ON briefs;
DROP POLICY IF EXISTS "Users can create own briefs" ON briefs;
DROP POLICY IF EXISTS "Service role has full access to briefs" ON briefs;
DROP POLICY IF EXISTS "Service role full access briefs" ON briefs;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- Create fresh policies
CREATE POLICY "Users can read their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Service role full access users"
ON users FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Users can read their own briefs"
ON briefs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own briefs"
ON briefs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own briefs"
ON briefs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own briefs"
ON briefs FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access briefs"
ON briefs FOR ALL
USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS users_stripe_customer_id_idx ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS users_stripe_subscription_id_idx ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_briefs_updated_at ON briefs;
CREATE TRIGGER update_briefs_updated_at
BEFORE UPDATE ON briefs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- CRITICAL: Auto-create user records
-- ===================================

-- Function to create user in users table when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, credits_remaining, subscription_status, plan_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    0, -- No credits until subscription
    'inactive',
    'none',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Delete mock user (no longer needed)
DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001';

-- ===================================
-- Fix existing auth users missing from users table
-- ===================================

-- Create records for any auth users that don't have them
INSERT INTO public.users (id, email, name, avatar_url, credits_remaining, subscription_status, plan_type, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ) as name,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  0 as credits_remaining,
  'inactive' as subscription_status,
  'none' as plan_type,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- Verification and Results
-- ===================================

-- Show completion message
SELECT '🎉 Migration completed successfully!' AS status;
SELECT 'Trigger created for auto-user creation' AS trigger_status;

-- Show all users and their status
SELECT 
  au.id,
  au.email,
  u.credits_remaining,
  u.subscription_status,
  u.stripe_customer_id IS NOT NULL as has_stripe,
  CASE 
    WHEN u.id IS NULL THEN '❌ MISSING (should not happen!)'
    WHEN u.subscription_status = 'active' THEN '✅ Active Subscription'
    ELSE '⚠️ No Subscription Yet'
  END as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;





