# Stripe Live Mode Setup Guide

Complete guide to switch from Stripe test mode to live/production mode.

---

## 📋 Step 1: Switch to Live Mode in Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. **Toggle the mode switcher** at the top (currently shows "Test mode")
3. Click **"Activate live mode"** or toggle to **"Live mode"**
4. Confirm the switch

**Important:** You'll now see a different dashboard with live data (separate from test mode).

---

## 🔑 Step 2: Get Your Live API Keys

1. In Stripe Dashboard (Live mode), go to **Developers** → **API keys**
2. You'll see two keys:

### **Publishable Key** (starts with `pk_live_...`)
- This is safe to expose in frontend code
- Copy this key

### **Secret Key** (starts with `sk_live_...`)
- ⚠️ **NEVER expose this publicly**
- Only use in server-side code
- Copy this key

---

## 💰 Step 3: Create Products & Prices in Live Mode

You need to create the same products you have in test mode, but in **live mode**.

### 3.1 Create Starter Plan

1. Go to **Products** in Stripe Dashboard (Live mode)
2. Click **"+ Add product"**
3. Configure:
   - **Name:** `Starter Plan`
   - **Description:** `20 blog briefs per month`
   - **Pricing model:** `Standard pricing`
   - **Price:** `$97.00`
   - **Billing period:** `Monthly` (recurring)
   - **Currency:** `USD`
4. Click **"Save product"**
5. **Copy the Price ID** (starts with `price_...`) - you'll need this!

### 3.2 Create Pro Plan

1. Click **"+ Add product"** again
2. Configure:
   - **Name:** `Pro Plan`
   - **Description:** `100 blog briefs per month`
   - **Pricing model:** `Standard pricing`
   - **Price:** `$247.00`
   - **Billing period:** `Monthly` (recurring)
   - **Currency:** `USD`
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_...`) - you'll need this!

---

## 🔗 Step 4: Set Up Production Webhook

### 4.1 Create Webhook Endpoint in Stripe

1. In Stripe Dashboard (Live mode), go to **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Configure:
   - **Endpoint URL:** `https://contenov.com/api/webhooks/stripe`
     (Replace `contenov.com` with your actual production domain)
   - **Description:** `Contenov Production Webhook`
   - **Events to send:** Select these events:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Click **"Add endpoint"**

### 4.2 Get Webhook Secret

1. After creating the webhook, click on it
2. Find **"Signing secret"** section
3. Click **"Reveal"** to show the secret
4. Copy the secret (starts with `whsec_...`)
5. **Save this** - you'll add it to Vercel environment variables

---

## ⚙️ Step 5: Update Environment Variables in Vercel

Go to Vercel → Your Project → **Settings** → **Environment Variables**

### Update/Add These Variables:

1. **STRIPE_SECRET_KEY**
   - **Value:** Your live secret key (`sk_live_...`)
   - **Environments:** Production only (or all if you want)
   - **Action:** Update existing or add new

2. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - **Value:** Your live publishable key (`pk_live_...`)
   - **Environments:** Production only (or all if you want)
   - **Action:** Update existing or add new

3. **STRIPE_WEBHOOK_SECRET**
   - **Value:** Your live webhook secret (`whsec_...`)
   - **Environments:** Production only
   - **Action:** Update existing or add new

4. **NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID**
   - **Value:** Your live Starter plan price ID (`price_...`)
   - **Environments:** Production only
   - **Action:** Update existing or add new

5. **NEXT_PUBLIC_STRIPE_PRO_PRICE_ID**
   - **Value:** Your live Pro plan price ID (`price_...`)
   - **Environments:** Production only
   - **Action:** Update existing or add new

### Keep Test Mode Variables for Development

You can keep your test mode variables for **Preview** and **Development** environments, and only use live keys for **Production**.

**Example setup:**
- **Production environment:** Live keys
- **Preview/Development:** Test keys (for testing)

---

## 🎯 Step 6: Update App URL (If Needed)

Make sure `NEXT_PUBLIC_APP_URL` is set to your production domain:

- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://contenov.com` (your actual domain)
- **Environments:** Production

---

## ✅ Step 7: Test the Setup

### 7.1 Test Checkout

1. Go to your live site: `https://contenov.com`
2. Sign up or log in
3. Go to pricing/select-plan page
4. Click on a plan
5. **Use a real credit card** (or Stripe test card won't work in live mode)
6. Complete checkout

### 7.2 Verify Webhook

1. After checkout, go to Stripe Dashboard → **Webhooks**
2. Click on your webhook endpoint
3. Check **"Events"** tab
4. You should see `checkout.session.completed` event
5. Click on it to see if it was successful (status 200)

### 7.3 Check Database

1. Go to Supabase → Table Editor → `users` table
2. Find the user who just subscribed
3. Verify:
   - `stripe_customer_id` is set
   - `stripe_subscription_id` is set
   - `subscription_status` = `'active'`
   - `credits_remaining` = 20 (Starter) or 100 (Pro)

---

## 🔒 Step 8: Security Checklist

- [ ] Live secret key is **only** in server-side environment variables
- [ ] Live publishable key is in `NEXT_PUBLIC_*` (safe for frontend)
- [ ] Webhook secret is set and webhook is verified
- [ ] Webhook endpoint URL uses HTTPS (production domain)
- [ ] Test mode keys are still available for development/testing

---

## 📝 Important Notes

### Test Mode vs Live Mode

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| API Keys | `pk_test_...` / `sk_test_...` | `pk_live_...` / `sk_live_...` |
| Webhook Secret | `whsec_...` (test) | `whsec_...` (live) |
| Price IDs | `price_...` (test) | `price_...` (live) |
| Payments | Test cards only | Real credit cards |
| Data | Separate test data | Real customer data |

### Keep Test Mode for Development

**Recommended setup:**
- Use **test mode** for local development and preview deployments
- Use **live mode** only for production

This way you can test without processing real payments.

### Webhook Testing

You can test webhooks locally using Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

But for production, you need the webhook endpoint configured in Stripe Dashboard.

---

## 🚨 Common Issues

### Issue: "No such price" error
**Solution:** Make sure you created products/prices in **live mode**, not test mode.

### Issue: Webhook not receiving events
**Solution:** 
1. Verify webhook URL is correct (HTTPS, correct domain)
2. Check webhook secret matches in Vercel
3. Verify webhook is enabled in Stripe Dashboard

### Issue: Payments not processing
**Solution:**
1. Make sure you're using live publishable key in frontend
2. Verify live secret key is set in Vercel
3. Check Stripe Dashboard for payment errors

---

## 🎉 You're Done!

Once all environment variables are updated and you've tested a checkout, your Stripe integration is live!

**Remember:**
- Test mode and live mode are completely separate
- Keep test keys for development
- Only use live keys in production
- Monitor webhook events in Stripe Dashboard

