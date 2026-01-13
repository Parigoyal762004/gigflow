# GigFlow - Quick Start (5 Minutes)

## Clone & Install

```bash
cd gigflow

# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

npm start
# Should show: "Server is running on port 5000"

# In a new terminal: Frontend
cd ../client
npm install
npm run dev
# Should show: "Local: http://localhost:5173/"
```

## Your First Test

1. Open `http://localhost:5173`
2. Sign up as "Alice" (alice@example.com / password)
3. Go Dashboard → Post New Gig
   - Title: "Build a Homepage"
   - Description: "Need a responsive homepage"
   - Budget: 500
4. Open new incognito window
5. Sign up as "Bob" (bob@example.com / password)
6. Go Browse → Find Alice's gig
7. Click it → Submit bid (message: "I can do this", price: 400)
8. Back to Alice's window → Dashboard → Browse your gigs
9. Click the gig → See Bob's bid
10. Click "Hire" → Toast notification appears
11. Go incognito (Bob's window) → See "You've been hired!" notification ✨

## What Just Worked

- ✅ Registration & JWT auth
- ✅ Gig creation
- ✅ Bidding system
- ✅ Atomic hiring (MongoDB transactions)
- ✅ Real-time notifications (Socket.io)

## Next Steps

- Read `README.md` for full project overview
- Read `SETUP.md` for detailed setup
- Read `HIRING_LOGIC.md` to understand the race condition prevention
- Read `PROJECT_STRUCTURE.md` to understand the codebase
- Read `DEPLOYMENT.md` when ready to deploy

## Troubleshooting

### Port already in use
```bash
# Change port in .env (backend) or vite.config.js (frontend)
```

### MongoDB connection failed
- Ensure MongoDB is running locally, OR
- Update `MONGODB_URI` in `.env` with Atlas connection string
- Check IP whitelist in MongoDB Atlas

### Socket.io not connecting
- Check `FRONTEND_URL` in server `.env` matches frontend URL
- Restart both servers

### Can't see bid after submitting
- Refresh the page
- Check Network tab in DevTools for errors

## Key Files

- **Hiring Logic**: `server/src/controllers/bidController.js` (line ~80)
- **Frontend Routes**: `client/src/App.jsx`
- **State Management**: `client/src/store/slices/`
- **API Calls**: `client/src/api/api.js`
- **Real-time**: `client/src/api/socket.js`

## Commands Cheat Sheet

```bash
# Backend
npm start        # Production
npm run dev      # Development with auto-reload

# Frontend
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Project Structure (Bird's Eye View)

```
gigflow/
├── server/         ← Node.js + Express
├── client/         ← React + Vite
├── README.md       ← Full overview
├── SETUP.md        ← Detailed setup
└── HIRING_LOGIC.md ← Race condition prevention explained
```

## What Makes This Special

1. **Atomic Hiring**: MongoDB transactions prevent race conditions
2. **Real-time Notifications**: Socket.io for instant updates
3. **Clean Code**: Clear separation of concerns, good naming
4. **Design**: Thoughtful UI with soft colors and smooth interactions
5. **Production Ready**: Error handling, validation, JWT auth

---

Happy coding! Questions? Check the detailed docs.
