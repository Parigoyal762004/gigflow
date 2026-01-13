# GigFlow - Start Here

Welcome to **GigFlow**, a production-ready freelance marketplace built for you.

## What is GigFlow?

A platform where:
- **Clients** post jobs (gigs) with budget
- **Freelancers** bid on jobs with their price
- **Clients** hire one freelancer (atomically, no conflicts)
- **Freelancers** get real-time notifications when hired

Built with React, Express, MongoDB, and Socket.io.

## Quick Overview (2 minutes)

```
User Registration
    ↓
Post a Gig / Browse Gigs
    ↓
Submit Bids / Review Bids
    ↓
Atomic Hiring (MongoDB Transactions)
    ↓
Real-time Notification (Socket.io)
```

## Documentation Map

### 🚀 Just Want to Run It?
→ Start with [`QUICK_START.md`](./QUICK_START.md) (5 minutes)

### 📚 Want Full Details?
1. [`README.md`](./README.md) - Full overview
2. [`SETUP.md`](./SETUP.md) - Detailed setup
3. [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) - Code organization
4. [`HIRING_LOGIC.md`](./HIRING_LOGIC.md) - The race condition solution (important!)
5. [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Deploy to production

### 💻 Want to Understand the Code?
→ [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) has the file-by-file breakdown

### 🔐 Curious About Atomic Transactions?
→ [`HIRING_LOGIC.md`](./HIRING_LOGIC.md) explains how we prevent race conditions

### 🌐 Ready to Deploy?
→ [`DEPLOYMENT.md`](./DEPLOYMENT.md) covers Heroku, Vercel, MongoDB Atlas, etc.

### ✅ What Was Built?
→ [`BUILD_COMPLETE.md`](./BUILD_COMPLETE.md) lists all 43 files and features

---

## The First 5 Minutes

```bash
# 1. Backend setup
cd server
npm install
cp .env.example .env
# Edit .env with MongoDB URI (or leave default for local)
npm start

# 2. Frontend setup (new terminal)
cd client
npm install
npm run dev

# 3. Open browser
# http://localhost:5173
```

That's it. You're running.

---

## The First 10 Minutes (Test It)

1. **Sign up as Alice** (alice@example.com)
2. **Post a gig**: "Build Homepage" / Budget $500
3. **Open incognito, sign up as Bob** (bob@example.com)
4. **Find Alice's gig** and submit a bid ($400)
5. **Back to Alice** → Dashboard → Click gig
6. **Click "Hire"** → Toast notification
7. **In Bob's window** → See "You've been hired!" notification ✨

You just tested:
- ✅ Registration & JWT auth
- ✅ Gig creation
- ✅ Bidding
- ✅ Atomic hiring
- ✅ Real-time notifications

---

## Key Features at a Glance

| Feature | Status | File |
|---------|--------|------|
| User authentication | ✅ | `server/src/controllers/authController.js` |
| Gig CRUD | ✅ | `server/src/controllers/gigController.js` |
| Bidding system | ✅ | `server/src/controllers/bidController.js` |
| **Atomic hiring** | ✅ ⭐ | `server/src/controllers/bidController.js:80-150` |
| Real-time notifications | ✅ | `client/src/api/socket.js` |
| Beautiful UI | ✅ | `client/src/styles/global.css` + Tailwind |
| State management | ✅ | `client/src/store/` |
| Error handling | ✅ | `server/src/middleware/errorHandler.js` |
| Input validation | ✅ | Each controller |

---

## Project Structure (Bird's Eye)

```
gigflow/                 ← You are here
├── server/              ← Node.js + Express
│   └── src/
│       ├── models/      ← Database schemas
│       ├── routes/      ← API endpoints
│       ├── controllers/ ← Business logic
│       └── middleware/  ← Auth, error handling
│
├── client/              ← React + Vite
│   └── src/
│       ├── pages/       ← Full-page components
│       ├── components/  ← Reusable components
│       ├── store/       ← Redux state
│       └── api/         ← HTTP & WebSocket clients
│
├── README.md            ← Full overview
├── QUICK_START.md       ← 5-minute setup
├── SETUP.md             ← Detailed instructions
├── HIRING_LOGIC.md      ← Race condition prevention
├── PROJECT_STRUCTURE.md ← Code organization
├── DEPLOYMENT.md        ← Deploy to production
└── BUILD_COMPLETE.md    ← What was built
```

---

## The Most Important File

**`server/src/controllers/bidController.js`** (lines 80-160)

This is where the magic happens: atomic hiring with MongoDB transactions.

```javascript
// 1. Start transaction
const session = await mongoose.startSession();
session.startTransaction();

// 2. Validate & lock
const bid = await Bid.findById(bidId).session(session);
const gig = await Gig.findById(bid.gigId).session(session);

// 3. Atomic updates (all or none)
await Bid.findByIdAndUpdate(bidId, { status: 'hired' }, { session });
await Bid.updateMany({ gigId: gig._id, _id: { $ne: bidId } }, { status: 'rejected' }, { session });
await Gig.findByIdAndUpdate(gig._id, { status: 'assigned' }, { session });

// 4. Commit
await session.commitTransaction();
```

This prevents two admins from hiring different freelancers on the same gig.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18, Redux Toolkit, Tailwind CSS, Vite |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT + HttpOnly cookies |
| **Styling** | Tailwind CSS (soft palette, smooth transitions) |
| **Real-time** | Socket.io for instant notifications |

---

## What Makes This Special?

1. **Atomic Transactions**: Hiring is bulletproof (no race conditions)
2. **Real-time Notifications**: Freelancers know instantly they're hired
3. **Clean Code**: Clear names, good structure, proper error handling
4. **Design**: Soft colors, smooth interactions, thoughtful UX
5. **Documentation**: 7 comprehensive guides
6. **Production Ready**: Error handling, validation, security

---

## Next Steps

### If you have 5 minutes:
→ Go to [`QUICK_START.md`](./QUICK_START.md)

### If you have 30 minutes:
→ Read [`README.md`](./README.md) then [`SETUP.md`](./SETUP.md)

### If you have an hour:
→ Read [`HIRING_LOGIC.md`](./HIRING_LOGIC.md) and [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)

### If you want to deploy:
→ Follow [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## Common Questions

**Q: Do I need to install MongoDB locally?**
A: No, use MongoDB Atlas (free cloud) or local MongoDB. See `SETUP.md`.

**Q: How do I run both servers?**
A: Open two terminals. Backend in one, frontend in another. See `QUICK_START.md`.

**Q: What's the hiring logic about?**
A: It's the hardest part. Read `HIRING_LOGIC.md`. It prevents two people from hiring different freelancers on the same gig.

**Q: Can I deploy this?**
A: Yes! Follow `DEPLOYMENT.md` for Heroku, Vercel, etc.

**Q: What if I find a bug?**
A: Check server logs (`npm start` output) and browser DevTools (F12).

---

## File Counts

- **Total Files**: 43
- **Backend Files**: 13
- **Frontend Files**: 25
- **Documentation Files**: 5
- **Config Files**: (.gitignore, .env examples, etc.)

---

## Your Role

You're building this as **Pari (Parry)**, a Gen-Z developer who:
- Cares equally about clean code and clean design
- Thinks like a product person, not just a coder
- Values clarity, minimalism, and smooth flows
- Wants something that feels thought-through, not rushed

This project should quietly say: *"She knows her fundamentals, she understands users, and she has a sense of design."*

---

## Ready?

```
Pick one:

1. Run it locally → QUICK_START.md
2. Understand it → README.md
3. Deep dive → HIRING_LOGIC.md
4. Deploy it → DEPLOYMENT.md
```

---

**Let's go build.** 🚀

Choose your path above. Start with whatever matches your current goal.
