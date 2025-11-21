# Email & PDF Feature Setup Guide

This guide will help you set up automatic PDF generation and email notifications for generated briefs.

## 📋 Overview

After a brief is generated, the system will:
1. ✅ Generate a PDF version of the brief
2. ✅ Upload it to Supabase Storage
3. ✅ Store the PDF URL in the database
4. ✅ Send an email to the user with a link to download the PDF

---

## 🔧 Step 1: Supabase Storage Setup

### 1.1 Create Storage Bucket

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name:** `brief-pdfs`
   - **Public bucket:** ✅ **YES** (checked) - This allows public access to PDFs via URL
   - **File size limit:** 10 MB (default is fine)
   - **Allowed MIME types:** `application/pdf` (optional, for extra security)
5. Click **"Create bucket"**

### 1.2 Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

1. Click on the `brief-pdfs` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Allow authenticated users to upload PDFs

- **Policy name:** `Users can upload their own PDFs`
- **Allowed operation:** `INSERT`
- **Policy definition:**
  ```sql
  (bucket_id = 'brief-pdfs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
  ```
- **Description:** Users can only upload PDFs to their own folder (`briefs/{user_id}/`)

#### Policy 2: Allow public read access

- **Policy name:** `Public read access for PDFs`
- **Allowed operation:** `SELECT`
- **Policy definition:**
  ```sql
  bucket_id = 'brief-pdfs'::text
  ```
- **Description:** Anyone with the URL can read/download PDFs (needed for email links)

#### Policy 3: Allow service role full access (for server-side uploads)

- **Policy name:** `Service role full access`
- **Allowed operation:** `ALL` (or `INSERT`, `SELECT`, `UPDATE`, `DELETE`)
- **Policy definition:**
  ```sql
  true
  ```
- **Description:** Service role (server-side) has full access to manage PDFs

**Note:** The service role bypasses RLS, so this policy is mainly for documentation. The server-side code uses the service role key, so it will work regardless.

### 1.3 Verify Storage Setup

1. Go to **Storage** → `brief-pdfs` bucket
2. Verify the bucket is **Public** (should show a globe icon)
3. Check that policies are active

---

## 📧 Step 2: Resend Email Service Setup

### 2.1 Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2.2 Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click **"Create API Key"**
3. Name it: `Contenov Production` (or `Contenov Development`)
4. Select permissions: **"Sending access"**
5. Copy the API key (starts with `re_...`)

### 2.3 Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **"Add Domain"**
3. Enter your domain (e.g., `contenov.com`)
4. Add the DNS records Resend provides to your domain's DNS settings
5. Wait for verification (usually a few minutes)

**For development/testing:** You can use Resend's default domain, but emails will come from `onboarding@resend.dev` (may go to spam).

### 2.4 Add Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Contenov <noreply@yourdomain.com>
```

**For development (using Resend's default domain):**
```bash
RESEND_FROM_EMAIL=Contenov <onboarding@resend.dev>
```

**For production (with verified domain):**
```bash
RESEND_FROM_EMAIL=Contenov <noreply@yourdomain.com>
```

---

## 🗄️ Step 3: Database Migration

### 3.1 Run SQL Migration

1. Go to Supabase → **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `EMAIL-PDF-SETUP.sql`
4. Click **"Run"**
5. Verify you see: `✅ Migration completed successfully!`

This adds the `pdf_url` column to the `briefs` table.

---

## ✅ Step 4: Verify Setup

### 4.1 Test PDF Generation

1. Generate a new brief from the dashboard
2. Check the browser console for logs:
   - Should see: `✅ Step 6 complete: PDF uploaded. URL: ...`
3. Check Supabase Storage:
   - Go to **Storage** → `brief-pdfs` bucket
   - Should see a folder structure: `briefs/{user_id}/{brief_id}.pdf`

### 4.2 Test Email Sending

1. Generate a brief
2. Check your email inbox (and spam folder)
3. You should receive an email with:
   - Subject: `Your brief for "{topic}" is ready! 🎉`
   - Two buttons: "Download PDF" and "View in Dashboard"
   - PDF download link

### 4.3 Check Database

1. Go to Supabase → **Table Editor** → `briefs`
2. Find the newly generated brief
3. Verify the `pdf_url` column has a value (should be a Supabase Storage URL)

---

## 🔍 Troubleshooting

### PDF Not Uploading

**Symptoms:** Brief generates but no PDF URL in database

**Solutions:**
1. Verify Storage bucket `brief-pdfs` exists and is **Public**
2. Check server logs for upload errors
3. Verify service role key is correct in `.env.local`
4. Check bucket policies allow INSERT operations

### Email Not Sending

**Symptoms:** Brief generates but no email received

**Solutions:**
1. Check `RESEND_API_KEY` is set in `.env.local`
2. Verify Resend API key is valid (check Resend dashboard)
3. Check server logs for email errors
4. Check spam folder
5. For development, ensure you're using `onboarding@resend.dev` as from email

### PDF URL Not Accessible

**Symptoms:** Email received but PDF link doesn't work

**Solutions:**
1. Verify Storage bucket is **Public**
2. Check the PDF file exists in Storage
3. Verify the URL format is correct (should be: `https://[project].supabase.co/storage/v1/object/public/brief-pdfs/...`)
4. Check browser console for CORS errors

### Storage Permission Errors

**Symptoms:** `new row violates row-level security policy`

**Solutions:**
1. Verify Storage policies are set up correctly (see Step 1.2)
2. Ensure service role is being used (server-side code uses `supabaseAdmin`)
3. Check that the bucket allows the service role to upload

---

## 📝 Environment Variables Summary

Add these to `.env.local`:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Contenov <noreply@yourdomain.com>

# Existing variables (should already be set)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Verify domain in Resend (recommended)
- [ ] Update `RESEND_FROM_EMAIL` to use your verified domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Test complete flow: Generate brief → Check email → Download PDF
- [ ] Verify PDF links work and are accessible
- [ ] Check email deliverability (not going to spam)
- [ ] Monitor Resend dashboard for email delivery rates

---

## 📚 Additional Resources

- **Resend Documentation:** https://resend.com/docs
- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **Supabase Storage Policies:** https://supabase.com/docs/guides/storage/security/access-control

---

## 🎉 You're All Set!

Once setup is complete, every new brief will automatically:
1. Generate a PDF
2. Upload to Supabase Storage
3. Send an email with download link

Users can close the browser window after submitting, and they'll receive an email when the brief is ready!

