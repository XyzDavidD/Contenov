-- ============================================
-- EMAIL & PDF FEATURE - DATABASE MIGRATION
-- ============================================
-- This migration adds the pdf_url column to the briefs table
-- Run this in Supabase SQL Editor after setting up Storage

-- Add pdf_url column to briefs table
ALTER TABLE briefs 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN briefs.pdf_url IS 'Public URL to the PDF file stored in Supabase Storage';

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'briefs' 
  AND column_name = 'pdf_url';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📄 pdf_url column added to briefs table';
END $$;

