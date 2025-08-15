-- COMPLETE SQL script to fix restaurants table schema
-- Based on analysis of admin dashboard and simple-supabase.ts
-- Run this in Supabase SQL Editor

-- Add all missing columns
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS contactPerson TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS contactNumber TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsappLink TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS customerCode TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS promoCredits INTEGER DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS trialClickLimit INTEGER DEFAULT 30;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS trialClicksUsed INTEGER DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS trialStartDate TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT true;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns from simple-supabase.ts expectations
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address TEXT;

-- Fix cuisine column - make it nullable or add default value
-- If cuisine column exists and has NOT NULL constraint, fix it
ALTER TABLE restaurants ALTER COLUMN cuisine DROP NOT NULL;
-- Or set a default value if needed
ALTER TABLE restaurants ALTER COLUMN cuisine SET DEFAULT 'General';

-- Show current structure to verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;
