# Daily Meal Deals - PWA Platform

**🚀 FORCING FRESH DEPLOYMENT - Build fix attempt #2**

A location-aware Progressive Web App (PWA) that connects customers with daily meal deals from local restaurants in South Africa. Starting with eMalahleni, Mpumalanga, with plans for nationwide expansion.

## 🎯 Project Overview

Daily Meal Deals serves three distinct user roles:
- **Customers**: Discover daily deals without requiring login
- **Restaurant Owners**: Manage deals and view analytics
- **Platform Administrator**: Oversee the entire ecosystem

## 🚀 Features

### Customer Features
- **Location-Based Discovery**: Automatic location detection with 25km radius
- **Deal Browsing**: View daily deals by day of the week
- **Promotion System**: "Super Boost" popup and ranked promotional slots
- **Direct Contact**: Call and WhatsApp integration for ordering
- **Filtering**: Filter by cuisine type and delivery options

### Restaurant Owner Features
- **Deal Management**: Create, edit, and schedule recurring deals
- **Analytics Dashboard**: View counts and contact clicks
- **Promotion Store**: Purchase promotional slots with credits
- **Profile Management**: Update restaurant information and hours

### Admin Features
- **Restaurant Management**: Approve/disable restaurants
- **Payment Tracking**: Manual payment marking and credit management
- **Platform Analytics**: Overview of platform performance

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **PWA**: next-pwa for offline capabilities
- **Deployment**: Vercel (app) + Supabase (database)
- **Location**: Browser geolocation API

## 📱 Business Model

- **Subscription**: R499/month for restaurants
- **Trial Offer**: 3 months free OR 30 contact clicks (whichever comes first)
- **Promotions**: Tiered promotional slots (Position 1, 2, 3)
- **Expansion**: City-by-city rollout with telesales onboarding

## 🏗 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── deals/
│   │       └── route.ts          # Deals API endpoint
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx          # Admin dashboard
│   ├── restaurant/
│   │   └── dashboard/
│   │       └── page.tsx          # Restaurant dashboard
│   ├── layout.tsx                # Root layout with PWA config
│   └── page.tsx                  # Customer homepage
├── lib/
│   └── prisma.ts                 # Database client
└── prisma/
    └── schema.prisma             # Database schema
```

## 🗄 Database Schema

The database includes these main entities:
- **User**: Restaurant owners and admins
- **Restaurant**: Business profiles with geospatial data
- **Deal**: Meal deals with scheduling and pricing
- **Promotion**: Ranked promotional slots
- **Analytics**: View and click tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy `.env.local` and update with your database URL and other configuration.

3. **Set up the database**:
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open the application**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Development URLs
- **Customer Interface**: `http://localhost:3000`
- **Restaurant Dashboard**: `http://localhost:3000/restaurant/dashboard`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`

## 📋 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌍 Deployment

### Database Setup
1. Create a PostgreSQL database (recommend Supabase)
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npx prisma migrate deploy`

### App Deployment
1. Deploy to Vercel (recommended)
2. Set environment variables in Vercel dashboard
3. Enable PWA features for mobile app-like experience

## 📖 API Documentation

### GET /api/deals
Fetch deals based on location and filters.

**Parameters**:
- `day`: Day of the week (default: TODAY)
- `lat`: User latitude (default: eMalahleni)
- `lng`: User longitude (default: eMalahleni)
- `radius`: Search radius in km (default: 25)

### POST /api/deals
Record deal interactions (views, clicks).

**Body**:
```json
{
  "dealId": "string",
  "action": "view" | "click"
}
```

## 🎨 Design Principles

- **Mobile-First**: Optimized for mobile devices
- **Progressive Enhancement**: Works offline with PWA features
- **Location-Aware**: Geo-based deal discovery
- **Performance**: Fast loading with SSR and caching
- **Accessibility**: Responsive design and keyboard navigation

## 🔮 Future Roadmap

- [ ] Native Android/iOS apps
- [ ] Real-time chat integration
- [ ] Advanced analytics and reporting
- [ ] Multiple payment gateways
- [ ] Multi-language support
- [ ] Franchise management system

## 📄 License

This project is proprietary software developed for Daily Meal Deals platform.

---

**Daily Meal Deals** - Connecting communities with local food businesses across South Africa 🇿🇦
