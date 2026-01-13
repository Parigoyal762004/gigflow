# GigFlow Project Structure

## Directory Layout

```
gigflow/
│
├── README.md                    # Main project documentation
├── SETUP.md                     # Detailed setup instructions
├── PROJECT_STRUCTURE.md         # This file
├── .gitignore
│
├── server/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js         # User schema: name, email, password
│   │   │   ├── Gig.js          # Gig schema: title, description, budget, status
│   │   │   └── Bid.js          # Bid schema: gigId, freelancerId, message, price, status
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js   # /api/auth/* endpoints
│   │   │   ├── gigRoutes.js    # /api/gigs/* endpoints
│   │   │   └── bidRoutes.js    # /api/bids/* endpoints
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js    # register, login, logout, me
│   │   │   ├── gigController.js     # CRUD operations for gigs
│   │   │   └── bidController.js     # Bidding & atomic hiring logic ⭐
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   └── errorHandler.js     # Centralized error handling
│   │   │
│   │   └── index.js            # Express app + Socket.io setup
│   │
│   ├── .env.example            # Environment template
│   └── package.json
│
└── client/                      # Frontend (React + Vite)
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx             # Landing page
    │   │   ├── Register.jsx         # Sign up page
    │   │   ├── Login.jsx            # Sign in page
    │   │   ├── Browse.jsx           # Browse all open gigs
    │   │   ├── GigDetail.jsx        # Single gig + bid submission
    │   │   ├── Dashboard.jsx        # User's posted gigs + my bids
    │   │   ├── BidManagement.jsx    # View bids for a gig (owner only)
    │   │   └── ProtectedRoute.jsx   # Auth guard for pages
    │   │
    │   ├── components/
    │   │   ├── Navbar.jsx           # Navigation header
    │   │   ├── NotificationCenter.jsx # Toast notifications
    │   │   ├── GigCard.jsx          # Reusable gig card
    │   │   └── BidCard.jsx          # Reusable bid card + hire button
    │   │
    │   ├── store/
    │   │   └── slices/
    │   │       ├── authSlice.js     # Auth state (user, loading, error)
    │   │       ├── gigsSlice.js     # Gigs state (all gigs, my gigs)
    │   │       ├── bidsSlice.js     # Bids state (gig bids, my bids)
    │   │       └── notificationSlice.js # Notifications
    │   │
    │   ├── api/
    │   │   ├── api.js           # Axios instance + all API calls
    │   │   └── socket.js        # Socket.io client setup
    │   │
    │   ├── styles/
    │   │   └── global.css       # Tailwind + custom styles
    │   │
    │   ├── App.jsx              # Main app router + auth check
    │   └── main.jsx             # React entry point
    │
    ├── index.html               # HTML template
    ├── vite.config.js           # Vite configuration
    ├── tailwind.config.js       # Tailwind theme customization
    ├── postcss.config.js        # PostCSS setup
    ├── .env.example             # Environment template
    └── package.json
```

## Key Features & Files

### 1. Authentication
- **File**: `server/src/controllers/authController.js`
- **JWT tokens** stored in **HttpOnly cookies**
- Protected routes with `authenticate` middleware
- Optional auth for browsing with `optionalAuth` middleware

### 2. Gig Management (CRUD)
- **File**: `server/src/controllers/gigController.js`
- Create, read, update, delete gigs
- Search/filter by title
- Track gig status: `open` → `assigned`

### 3. Bidding System
- **File**: `server/src/controllers/bidController.js`
- Freelancers submit bids with message + price
- Owners review all bids for their gig
- Prevent duplicate bids from same freelancer

### 4. Atomic Hiring Logic ⭐
- **File**: `server/src/controllers/bidController.js::hireBidder()`
- Uses **MongoDB transactions** for atomicity
- One-click hiring:
  1. Mark chosen bid as `hired`
  2. Reject all other bids
  3. Mark gig as `assigned`
  4. All happen together or not at all
- Prevents race conditions (concurrent hire attempts)
- Emits Socket.io notification to freelancer

### 5. Real-time Notifications
- **File**: `client/src/api/socket.js`
- Socket.io connection on login
- Freelancer joins user-specific room
- Instant notification when hired (no page refresh)
- Toast notification in frontend

### 6. State Management (Redux)
- `authSlice`: User, auth status, errors
- `gigsSlice`: All gigs, user's gigs, selected gig
- `bidsSlice`: Gig bids, user's bids
- `notificationSlice`: Notifications queue

### 7. Styling (Tailwind + Custom)
- Soft color palette (purples, neutrals)
- Rounded corners, generous spacing
- Smooth transitions and hover states
- Responsive grid layouts
- Custom `tailwind.config.js` with extended theme

## Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Gig
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  budget: Number (required),
  ownerId: ObjectId (ref: User),
  status: 'open' | 'assigned',
  hiringBidId: ObjectId (ref: Bid, nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### Bid
```javascript
{
  _id: ObjectId,
  gigId: ObjectId (ref: Gig, required),
  freelancerId: ObjectId (ref: User, required),
  message: String (required),
  price: Number (required),
  status: 'pending' | 'hired' | 'rejected',
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Auth
```
POST   /api/auth/register    → Create account
POST   /api/auth/login       → Sign in
POST   /api/auth/logout      → Sign out
GET    /api/auth/me          → Get current user
```

### Gigs
```
POST   /api/gigs             → Create gig (auth required)
GET    /api/gigs             → Browse all gigs (public, search optional)
GET    /api/gigs/my/gigs     → Get user's gigs (auth required)
GET    /api/gigs/:gigId      → Get gig details (public)
PATCH  /api/gigs/:gigId      → Update gig (auth required, owner only)
DELETE /api/gigs/:gigId      → Delete gig (auth required, owner only)
```

### Bids
```
POST   /api/bids             → Submit bid (auth required)
GET    /api/bids/my/bids     → Get user's bids (auth required)
PATCH  /api/bids/:bidId/hire → Hire bidder [ATOMIC] (auth required, owner only)
GET    /api/bids/:gigId      → Get bids for gig (auth required, owner only)
```

## Socket.io Events

### Client → Server
- `join-user` - Freelancer joins notification room

### Server → Client
- `hired` - Freelancer hired notification
  ```javascript
  {
    bidId: String,
    gigId: String,
    gigTitle: String,
    message: "Congratulations! You've been hired for..."
  }
  ```

## Important Notes

1. **Hiring is Atomic**: The `hireBidder` endpoint uses MongoDB transactions. If any update fails, all rollback.
2. **Passwords are Hashed**: bcryptjs with salt rounds of 10.
3. **JWTs Expire**: Set to 7 days. Stored in HttpOnly cookies (secure).
4. **Bids are Unique**: One freelancer can only bid once per gig (unique index).
5. **Empty States**: Every page handles "no data" scenario gracefully.
6. **Error Handling**: Centralized error middleware provides consistent responses.

## Development

Start both servers:

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Visit `http://localhost:5173`

## Deployment

### Backend
- Deploy to Heroku, Railway, or Render
- Set environment variables
- Ensure MongoDB Atlas IP whitelist includes server

### Frontend
- Deploy to Vercel or Netlify
- Update `VITE_API_URL` to production backend URL
- Run `npm run build` for production build
