-- PHASE 1: Ultra-Simple Restaurant Table
-- No enums, no foreign keys, just basic functionality

-- Drop everything first (run these one by one in Supabase SQL Editor)
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS "PromotionPosition" CASCADE;
DROP TYPE IF EXISTS "DayOfWeek" CASCADE;
DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Create simple restaurants table (Phase 1)
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT,
  latitude FLOAT DEFAULT 0,
  longitude FLOAT DEFAULT 0,
  subscription_status TEXT DEFAULT 'TRIAL',
  promo_credits INTEGER DEFAULT 0,
  whatsapp_number TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simple update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON restaurants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, restrict later)
CREATE POLICY "Allow all operations on restaurants" ON restaurants
  FOR ALL USING (true) WITH CHECK (true);

-- Insert test data
INSERT INTO restaurants (name, email, phone, address, password_hash) VALUES
('Test Restaurant 1', 'test1@restaurant.com', '0123456789', 'eMalahleni, Mpumalanga', 'password123'),
('Test Restaurant 2', 'test2@restaurant.com', '0987654321', 'Pretoria, Gauteng', 'password123');
