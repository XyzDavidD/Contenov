-- Fix existing users who have 0 credits due to webhook failure
-- Run this in Supabase SQL Editor after fixing the webhook issues

-- First, let's see which users have subscriptions but 0 credits
SELECT 
  id,
  email,
  subscription_status,
  credits_remaining,
  plan_type,
  stripe_customer_id,
  stripe_subscription_id
FROM users 
WHERE subscription_status = 'active' 
  AND credits_remaining = 0;

-- If you see users above, run this to fix them:
-- (Replace 'starter' with 'pro' if they have a pro plan)

UPDATE users 
SET 
  credits_remaining = CASE 
    WHEN plan_type = 'starter' THEN 20
    WHEN plan_type = 'pro' THEN 100
    ELSE 20
  END,
  updated_at = NOW()
WHERE subscription_status = 'active' 
  AND credits_remaining = 0;

-- Verify the fix
SELECT 
  email,
  subscription_status,
  credits_remaining,
  plan_type
FROM users 
WHERE subscription_status = 'active';

-- If you need to manually set a specific user's plan and credits:
-- UPDATE users 
-- SET 
--   subscription_status = 'active',
--   plan_type = 'starter',
--   credits_remaining = 20,
--   updated_at = NOW()
-- WHERE email = 'your-email@example.com';
