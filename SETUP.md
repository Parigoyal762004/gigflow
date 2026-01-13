# GigFlow Setup Guide

Follow these steps to get GigFlow running locally.

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Quick Start

### 1. Clone the Repository

```bash
cd gigflow
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow
JWT_SECRET=your_super_secret_key_here_12345
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**MongoDB Setup:**
- **Local**: `mongodb://localhost:27017/gigflow`
- **Atlas**: Get connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

Start the server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
Connected to MongoDB
Server is running on port 5000
```

### 3. Set Up the Frontend

In a new terminal:

```bash
cd client
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

The default `.env.example` already points to `http://localhost:5000`, which is correct for local development.

Start the development server:

```bash
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in 123 ms
  ➜  Local:   http://localhost:5173/
```

## Testing the Platform

### Scenario 1: Post a Gig and Receive a Bid

1. Open `http://localhost:5173` in your browser
2. Sign up as User A (Client)
3. Go to Dashboard → Post New Gig
4. Create a gig with:
   - Title: "Build a Landing Page"
   - Description: "Need a responsive landing page..."
   - Budget: 500
5. Open a new incognito window and sign up as User B (Freelancer)
6. Go to Browse Gigs and find User A's gig
7. Click the gig and submit a bid with:
   - Message: "I can build this in 3 days..."
   - Price: 400
8. Go back to User A's window (Dashboard → Posted Gigs)
9. Click on the gig card to see bids

### Scenario 2: Hire and Test Real-time Notifications

1. From User A's dashboard, check the gig with bids
2. Click the "Hire" button on User B's bid
3. In User B's window, you should see a notification:
   - "Congratulations! You've been hired for [Gig Title]"
4. Check User B's Dashboard → My Bids to see status changed to "✓ Hired"
5. All other bids (if any) show "✗ Rejected"

### Scenario 3: Test Race Conditions (Optional)

This tests the atomic transaction logic:

1. Create a gig with multiple bids
2. Open two windows with the same client (User A)
3. Try clicking "Hire" on different bids simultaneously
4. Only one will succeed; the other will see an error
5. This demonstrates MongoDB transaction atomicity

## Troubleshooting

### "Cannot connect to MongoDB"

**Solution**: Check your MongoDB connection string in `.env`
- Ensure MongoDB is running (local) or Atlas is accessible
- Verify IP whitelist in MongoDB Atlas (if cloud)
- Check username/password credentials

### "Module not found" errors

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 5000 or 5173 already in use

**Solution**: Change the port in the environment file or kill the process using that port

### CORS errors in browser console

**Solution**: Ensure `FRONTEND_URL` in server `.env` matches your frontend URL (usually `http://localhost:5173`)

### Real-time notifications not working

**Solution**: Check that Socket.io is connecting in browser DevTools:
1. Open DevTools → Network → WS (WebSocket)
2. Look for a Socket.io connection
3. If not connecting, verify `FRONTEND_URL` in server `.env`

## Project Structure

```
gigflow/
├── server/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   └── index.js         # Express app
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── pages/           # React pages
    │   ├── components/      # Reusable components
    │   ├── store/           # Redux slices
    │   ├── api/             # API & Socket clients
    │   ├── styles/          # Global CSS
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

## Key Files to Understand

### Backend

- **`/server/src/controllers/bidController.js`** - Contains the atomic hiring logic with MongoDB transactions
- **`/server/src/middleware/auth.js`** - JWT authentication
- **`/server/src/models/`** - Data schema definitions

### Frontend

- **`/client/src/store/slices/`** - Redux state management
- **`/client/src/pages/Dashboard.jsx`** - Main user dashboard
- **`/client/src/api/socket.js`** - Real-time Socket.io setup

## Environment Variables Reference

### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_random_secret_key` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` or `production` |

### Client (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## Next Steps

Once everything is working locally:

1. **Database Backup**: Set up MongoDB backups
2. **Error Logging**: Implement Sentry or similar
3. **Testing**: Add unit and integration tests
4. **CI/CD**: Set up GitHub Actions for automated testing
5. **Deployment**: Deploy to Heroku, Vercel, or similar

## API Reference

### Auth Endpoints
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Gigs Endpoints
- `POST /api/gigs` - Create gig
- `GET /api/gigs` - Get all open gigs (with search)
- `GET /api/gigs/my/gigs` - Get user's gigs
- `GET /api/gigs/:gigId` - Get single gig
- `PATCH /api/gigs/:gigId` - Update gig
- `DELETE /api/gigs/:gigId` - Delete gig

### Bids Endpoints
- `POST /api/bids` - Submit a bid
- `GET /api/bids/my/bids` - Get user's bids
- `GET /api/bids/:gigId` - Get bids for a gig
- `PATCH /api/bids/:bidId/hire` - Hire a bidder (atomic)

## Support

For issues or questions, check:
- Browser DevTools Console (F12)
- Server terminal for error logs
- MongoDB compass for data verification

Happy building!
