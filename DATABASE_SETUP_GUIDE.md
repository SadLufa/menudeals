# 🚨 DATABASE SETUP REQUIRED

## The Issue
Your Supabase database doesn't have the required tables yet. This is why you're seeing the "Error fetching restaurants" message.

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Login to your account
3. Select your project (the one with `gvmkztkqbgkwxlttaaol` in the URL)

### Step 2: Run the Database Setup
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the entire contents of `setup_database.sql` (from this project folder)
4. Click **"RUN"** (the play button)

### Step 3: Verify Setup
1. Go to **"Table Editor"** in the left sidebar
2. You should now see these tables:
   - `users`
   - `restaurants` 
   - `deals`
   - `promotions`
   - `analytics`

### Step 4: Test Your App
1. Refresh your admin dashboard at `http://localhost:3000/admin/dashboard`
2. The error should be gone!
3. Try adding a new restaurant

## Alternative: Quick Database Setup

If you prefer, you can also:

1. **Use Prisma CLI** (if you have PostgreSQL tools):
   ```bash
   npx prisma db push
   ```

2. **Manual table creation** via Supabase dashboard:
   - Go to Table Editor
   - Create tables manually using the schema from `prisma/schema.prisma`

## What These Tables Do

- **users**: Store restaurant owner accounts
- **restaurants**: Store restaurant information and subscription status
- **deals**: Store daily meal deals
- **promotions**: Handle promoted deal slots
- **analytics**: Track views and clicks

## Once Setup is Complete

Your app will have:
✅ Real-time restaurant management
✅ Database-backed authentication  
✅ Live sync between local and production
✅ Subscription management
✅ Analytics tracking

**Need help?** The SQL in `setup_database.sql` creates all required tables with the correct relationships and constraints.
