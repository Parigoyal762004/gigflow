# GigFlow

A thoughtfully designed mini-freelance marketplace where clients post jobs and freelancers bid on them. Built with a focus on clean code, smooth user experience, and atomic transactional integrity.

## Overview

GigFlow lets any user wear two hats: post a job (Client) or bid on jobs (Freelancer). The platform handles complex workflows—like the hiring logic—with transaction-level safety to prevent race conditions.

## What's Inside

- **Clean Auth**: JWT tokens in HttpOnly cookies. No fuss, just security.
- **Job Management**: Post, search, and browse gigs with real-time updates.
- **Smart Bidding**: Freelancers bid on gigs; clients review and hire.
- **Atomic Hiring**: MongoDB transactions ensure only one freelancer gets hired, even with concurrent clicks.
- **Real-time Notifications**: Socket.io delivers instant "You're hired!" messages.
- **Aesthetic Design**: Soft color palette, smooth interactions, intentional micro-copy.

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- MongoDB Transactions (for atomic operations)

**Frontend**
- React 18 (Vite)
- Redux Toolkit (state management)
- Tailwind CSS (styling)
- Socket.io Client

## Project Structure

```
gigflow/
├── server/                 # Backend
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, error handling
│   │   ├── utils/         # Helpers
│   │   └── app.js         # Express app
│   ├── .env.example
│   └── package.json
│
└── client/                 # Frontend
    ├── src/
    │   ├── pages/         # React pages
    │   ├── components/    # Reusable components
    │   ├── store/         # Redux slices
    │   ├── api/           # API client
    │   ├── styles/        # Global styles
    │   └── App.jsx
    ├── tailwind.config.js
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

1. **Clone and enter the project:**
   ```bash
   cd gigflow
   ```

2. **Set up backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, etc.
   npm start
   ```

3. **Set up frontend (in new terminal):**
   ```bash
   cd client
   npm install
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

## Core Features

### 1. Authentication
- Sign up with email and password
- Login with secure JWT tokens in HttpOnly cookies
- Auto-logout on token expiry

### 2. Gig Management
- Create a gig with title, description, and budget
- Browse all open gigs with search/filter
- View detailed gig and bid information

### 3. Bidding
- Submit a bid with a message and proposed price
- View bids as a client, manage as a freelancer
- Track bid status (pending, hired, rejected)

### 4. Hiring (The Tricky Part)
When a client clicks "Hire" on a bid:
1. A MongoDB transaction starts
2. The chosen bid status → "hired"
3. All other bids for that gig → "rejected"
4. The gig status → "assigned"
5. Transaction commits atomically or rolls back entirely

No race conditions. Ever.

### 5. Real-time Notifications (Bonus)
- When hired, freelancers get instant Socket.io notifications
- No page refresh needed
- Clean notification center in dashboard

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Gigs
- `POST /api/gigs` - Create a new gig
- `GET /api/gigs` - List all open gigs (with search)
- `GET /api/gigs/:gigId` - Get gig details
- `PATCH /api/gigs/:gigId` - Update gig (owner only)
- `DELETE /api/gigs/:gigId` - Delete gig (owner only)

### Bids
- `POST /api/bids` - Submit a bid
- `GET /api/bids/:gigId` - Get all bids for a gig (owner only)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (atomic)

## Design Philosophy

- **Clarity first**: If it's not clear why something exists, it doesn't.
- **Minimalism**: Every element earns its place.
- **Soft aesthetics**: Rounded corners, gentle colors, plenty of breathing room.
- **Smooth interactions**: Hover states, loading states, empty states all feel intentional.
- **Helpful micro-copy**: Error messages are human, not robotic.

## Development Notes

### The Hiring Flow (Critical)
See the hiring logic in `/server/src/controllers/bidController.js`. It uses MongoDB transactions to ensure atomicity:
```javascript
// Pseudo-code
const session = await mongoose.startSession();
session.startTransaction();

// 1. Update chosen bid to "hired"
// 2. Update all other bids to "rejected"
// 3. Update gig to "assigned"
// 4. Emit Socket.io event to freelancer

await session.commitTransaction();
```

This ensures that even if two admin users click "Hire" simultaneously, only one succeeds.

### Real-time Setup
Socket.io is integrated at the app level. When a hire happens:
1. Server emits a `hired` event to the freelancer's socket room
2. Frontend receives and shows notification
3. Dashboard updates without a page refresh

## Testing Locally

1. Create two accounts (one client, one freelancer)
2. Post a gig as the client
3. Bid on the gig as the freelancer
4. Hire the freelancer
5. Check both dashboards for proper state updates

## Deployment

**Backend**: Deploy to Heroku, Render, or Railway
- Set environment variables for MongoDB URI, JWT secret, etc.

**Frontend**: Deploy to Vercel, Netlify
- Build: `npm run build`
- Deploy the `dist/` folder

## What's Next

- Payment integration (Stripe)
- Reviews and ratings
- Dispute resolution
- Advanced search filters
- Freelancer profiles with portfolios

## License

MIT

---

Built with taste. No templating. Just clean vibes.
