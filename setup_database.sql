-- Create enum types first
CREATE TYPE "UserRole" AS ENUM ('RESTAURANT_OWNER', 'ADMIN');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRIAL');
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE "PromotionPosition" AS ENUM ('POSITION_1', 'POSITION_2', 'POSITION_3');

-- Create users table
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create restaurants table
CREATE TABLE "restaurants" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "whatsAppNumber" TEXT,
  "operatingHours" JSONB,
  "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
  "promoCredits" INTEGER NOT NULL DEFAULT 0,
  "trialClickCount" INTEGER NOT NULL DEFAULT 0,
  "trialStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ownerId" TEXT NOT NULL,
  CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- Create unique index on ownerId
CREATE UNIQUE INDEX "restaurants_ownerId_key" ON "restaurants"("ownerId");

-- Create index for geospatial queries
CREATE INDEX "restaurants_latitude_longitude_idx" ON "restaurants"("latitude", "longitude");

-- Create deals table
CREATE TABLE "deals" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "images" TEXT[],
  "daysActive" "DayOfWeek"[],
  "isRecurring" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "restaurantId" TEXT NOT NULL,
  CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- Create promotions table
CREATE TABLE "promotions" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "position" "PromotionPosition" NOT NULL,
  "dealId" TEXT NOT NULL,
  CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- Create analytics table
CREATE TABLE "analytics" (
  "id" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dealId" TEXT NOT NULL,
  CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deals" ADD CONSTRAINT "deals_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
