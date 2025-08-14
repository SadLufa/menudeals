# Daily Meal Deals - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a location-aware Progressive Web App (PWA) for Daily Meal Deals in South Africa. The platform connects customers with local restaurant deals and serves three user roles: Customers, Restaurant Owners, and Platform Administrators.

## Technology Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Hosting**: Vercel (app) + Supabase (database)
- **PWA**: next-pwa for offline capabilities
- **Location**: Browser geolocation API with fallback

## Key Features
- Location-based deal discovery
- Three user roles with different dashboards
- Deal promotion system with ranked slots
- Restaurant subscription management
- Analytics and performance tracking
- PWA with offline capabilities

## Code Guidelines
- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Implement responsive design with Tailwind CSS
- Use Prisma for all database operations
- Handle geospatial data with PostgreSQL
- Implement proper error handling and loading states
- Follow React best practices with hooks and components

## Database Schema
- User (restaurant owners & admins)
- Restaurant (with geospatial location)
- Deal (with recurring options)
- Promotion (ranked slots)
- Analytics (views & clicks)

## Business Logic
- Monthly subscription: R499
- Trial offer: 3 months free OR 30 contact clicks
- Promotion slots: Position 1, 2, 3 with pricing
- Location radius: 25km default
- Weekly deal scheduling
