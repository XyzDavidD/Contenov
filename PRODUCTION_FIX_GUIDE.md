# 🚨 PRODUCTION ISSUES FIX GUIDE

**Date:** October 12, 2025  
**Issues:** Webhook failing, No credits, Email redirect to localhost

---

## 🔍 **Issues Identified**

1. **Stripe Webhook 307 Redirect** - Webhook URL returning redirect instead of 200
2. **Users getting 0 credits** - Webhook failing, so subscription not activated
3. **Email confirmation redirects to localhost** - Supabase configured for localhost

---

## 🛠️ **SOLUTION 1: Fix Environment Variables in Vercel**

### Step 1: Add Missing Environment Variables

Go to your Vercel dashboard → Project Settings → Environment Variables

**Add these variables:**

```bash
# Stripe (CRITICAL - These are missing!)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (from your Stripe webhook)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxxx

# App URL (CRITICAL - This is wrong!)
NEXT_PUBLIC_APP_URL=https://contenov.com

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://sszhxavhgvlkhaoudxeo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# AI Services (should already exist)
SERP_API_KEY=xxxxx
JINA_API_KEY=xxxxx
GEMINI_API_KEY=xxxxx
```

### Step 2: Get Stripe Webhook Secret

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook: `https://contenov.com/api/webhooks/stripe`
3. Click "Reveal" next to "Signing secret"
4. Copy the `whsec_xxxxx` value
5. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### Step 3: Redeploy

After adding environment variables:
1. Go to Vercel → Deployments
2. Click "Redeploy" on latest deployment
3. Or push a new commit to trigger redeploy

---

## 🛠️ **SOLUTION 2: Fix Supabase Email Redirect**

### Step 1: Update Supabase Auth Settings

1. Go to: https://app.supabase.com/project/sszhxavhgvlkhaoudxeo/auth/url-configuration
2. Update **Site URL**: `https://contenov.com`
3. Update **Redirect URLs**:
   ```
   https://contenov.com/auth/callback
   https://contenov.com/dashboard
   https://contenov.com/select-plan
   ```

### Step 2: Update Email Templates (Optional)

1. Go to: https://app.supabase.com/project/sszhxavhgvlkhaoudxeo/auth/templates
2. Update "Confirm signup" template
3. Change redirect URL from `localhost:3000` to `https://contenov.com`

---

## 🛠️ **SOLUTION 3: Test Webhook Endpoint**

### Step 1: Test Your Webhook URL

Open browser and visit: `https://contenov.com/api/webhooks/stripe`

**Expected Result:**
- Should return `{"error":"No signature"}` (not a redirect)

**If you get a redirect:**
- Environment variables are missing
- Redeploy after adding them

### Step 2: Check Vercel Function Logs

1. Go to Vercel → Functions tab
2. Look for `/api/webhooks/stripe` logs
3. Check for errors about missing environment variables

---

## 🛠️ **SOLUTION 4: Manual Credit Fix**

### For Existing Users (who have 0 credits):

1. Go to Supabase → Table Editor → users
2. Find your user record
3. Update these fields:
   ```sql
   UPDATE users 
   SET 
     subscription_status = 'active',
     credits_remaining = 20,  -- or 100 for pro
     plan_type = 'starter'    -- or 'pro'
   WHERE email = 'your-email@example.com';
   ```

### Verify the fix:
1. Go to https://contenov.com/dashboard
2. Should see 20 credits in top nav
3. Should see real statistics

---

## 🧪 **Testing Steps**

### Step 1: Test Webhook
1. Create a new test user account
2. Go through checkout process
3. Check Vercel Functions logs for webhook calls
4. Should see `[WEBHOOK] ✅ User subscription activated with 20 credits`

### Step 2: Test Email Confirmation
1. Sign up with email/password
2. Check email for confirmation link
3. Click link - should redirect to `https://contenov.com/dashboard`
4. Not `localhost:3000`

### Step 3: Test Credits
1. After checkout completion
2. Go to dashboard
3. Should see 20 credits in top nav
4. Should be able to generate briefs

---

## 🚨 **CRITICAL CHECKLIST**

Before testing, verify:

- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] `NEXT_PUBLIC_APP_URL=https://contenov.com` in Vercel
- [ ] All Stripe keys added to Vercel
- [ ] Supabase Site URL updated to `https://contenov.com`
- [ ] Redeployed Vercel app
- [ ] Webhook URL returns JSON (not redirect)

---

## 📞 **Quick Debug Commands**

### Check if webhook is working:
```bash
curl https://contenov.com/api/webhooks/stripe
# Should return: {"error":"No signature"}
```

### Check Vercel environment variables:
1. Go to Vercel → Settings → Environment Variables
2. Verify all variables are listed
3. Make sure they're not empty

---

## 🔧 **If Still Not Working**

### Check Vercel Function Logs:
1. Go to Vercel → Functions
2. Click on `/api/webhooks/stripe`
3. Look for error messages
4. Common errors:
   - "STRIPE_WEBHOOK_SECRET is not defined"
   - "NEXT_PUBLIC_APP_URL is not defined"
   - "Signature verification failed"

### Test with Stripe CLI (Advanced):
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Test webhook locally
stripe listen --forward-to https://contenov.com/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

---

## ✅ **Expected Results After Fix**

1. **Webhook Status:** All events show `200` (success) instead of `307` (redirect)
2. **User Credits:** New users get 20 credits after checkout
3. **Email Redirect:** Confirmation emails redirect to `contenov.com`
4. **Dashboard:** Shows real credits and statistics

---

**Priority Order:**
1. ✅ Add missing environment variables to Vercel
2. ✅ Update Supabase URL settings
3. ✅ Redeploy Vercel
4. ✅ Test with new user signup

**This should fix all the issues!** 🎉
