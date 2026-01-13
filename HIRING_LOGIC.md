# The Hiring Logic: Atomic Transactions Explained

This document explains the most critical part of GigFlow: the hiring logic that prevents race conditions.

## The Problem

Imagine this scenario:

1. A gig has 3 bids: Alice, Bob, and Charlie
2. Two admins click "Hire Alice" at the *exact same time*
3. Without proper handling:
   - Both requests might mark Alice as hired
   - Both might reject the others
   - We end up with duplicate or corrupted state

**Solution**: Use MongoDB transactions for atomicity.

## How It Works

Location: `/server/src/controllers/bidController.js::hireBidder()`

### Step 1: Start Transaction

```javascript
const session = await mongoose.startSession();
session.startTransaction();
```

This creates a transaction scope where **all updates happen together or none at all**.

### Step 2: Verify & Validate

```javascript
const bid = await Bid.findById(bidId).session(session);
const gig = await Gig.findById(bid.gigId).session(session);

// Check: Only owner can hire
if (gig.ownerId.toString() !== req.userId) {
  await session.abortTransaction();
  return res.status(403).json({ error: '...' });
}

// Check: Gig must still be open
if (gig.status === 'assigned') {
  await session.abortTransaction();
  return res.status(400).json({ error: '...' });
}

// Check: Bid must be pending
if (bid.status !== 'pending') {
  await session.abortTransaction();
  return res.status(400).json({ error: '...' });
}
```

All queries are scoped to the session, ensuring we read the latest locked state.

### Step 3: Atomic Updates

```javascript
// 1. Mark chosen bid as hired
await Bid.findByIdAndUpdate(
  bidId,
  { status: 'hired' },
  { new: true, session }  // ← Must pass session
);

// 2. Reject all other bids for this gig
await Bid.updateMany(
  { gigId: bid.gigId, _id: { $ne: bidId } },
  { status: 'rejected' },
  { session }  // ← Must pass session
);

// 3. Mark gig as assigned
await Gig.findByIdAndUpdate(
  bid.gigId,
  { status: 'assigned', hiringBidId: bidId },
  { new: true, session }  // ← Must pass session
);
```

**Key**: Every update includes `{ session }` to stay in the transaction.

### Step 4: Commit or Rollback

```javascript
await session.commitTransaction();  // All changes are permanent
```

If any error occurs:
```javascript
catch (error) {
  await session.abortTransaction();  // All changes are discarded
  next(error);
}
finally {
  await session.endSession();  // Always close the session
}
```

## Why This Prevents Race Conditions

### Scenario: Two Hire Requests At The Same Time

**Initial State**:
- Gig: `{ status: 'open' }`
- Bid A: `{ status: 'pending' }`
- Bid B: `{ status: 'pending' }`

**Request 1** starts transaction, reads bid A and gig. Status is `open` ✓

**Request 2** starts transaction, reads bid B and gig. Status is... **LOCKED** by Request 1

Request 2 waits.

**Request 1** updates:
- Bid A → `hired`
- Bid B → `rejected`
- Gig → `assigned`

Transaction commits. Locks released.

**Request 2** now reads: Gig status is `assigned` ✗

Request 2 fails with: *"This gig has already been assigned"*

Only one request succeeds. Database stays clean.

## Real-time Notification

After the transaction succeeds, we emit a Socket.io event:

```javascript
const io = req.app.get('io');
io.to(`user:${bid.freelancerId}`).emit('hired', {
  bidId: bid._id,
  gigId: bid.gigId,
  gigTitle: gig.title,
  message: `Congratulations! You've been hired for ${gig.title}`,
});
```

**Important**: This happens **after** the transaction commits, outside its scope. If the notification fails, the database is already updated.

## Frontend Experience

1. Client clicks "Hire" button
2. Loading state shown
3. API request sent to `PATCH /api/bids/:bidId/hire`
4. Either:
   - **Success**: Toast notification, UI updates bid status to "✓ Hired"
   - **Error**: Toast notification with error message, UI unchanged

Freelancer sees notification via Socket.io (no refresh needed).

## Testing This Locally

### Test 1: Normal Hiring

1. Create a gig
2. Bid on it with another account
3. Click "Hire"
4. Verify:
   - Bid status changes to "✓ Hired"
   - Gig status changes to "🔒 Assigned"
   - Freelancer receives notification

### Test 2: Race Condition Prevention

1. Create a gig
2. Submit 2+ bids
3. Open two browser windows (same account)
4. Navigate to the same gig's bid management page in both
5. Click "Hire" on different bids in both windows simultaneously
6. One succeeds, one fails
7. Refresh both pages → Verify only one is hired

## Code Walkthrough

Here's the full hiring logic with comments:

```javascript
export const hireBidder = async (req, res, next) => {
  // Step 1: Start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Step 2: Read chosen bid (locked until transaction ends)
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Step 3: Read the associated gig (locked)
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Step 4: Verify authorization
    if (gig.ownerId.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Step 5: Check if gig is still open
    // (If another request already hired someone, this will fail)
    if (gig.status === 'assigned') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Already assigned' });
    }

    // Step 6: Check if bid is still pending
    if (bid.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Not available' });
    }

    // Step 7: ATOMIC UPDATES (all or none)
    
    // Update chosen bid
    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { new: true, session }
    );

    // Reject all competing bids
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId } },
      { status: 'rejected' },
      { session }
    );

    // Mark gig as assigned
    await Gig.findByIdAndUpdate(
      bid.gigId,
      { status: 'assigned', hiringBidId: bidId },
      { new: true, session }
    );

    // Step 8: Commit all changes atomically
    await session.commitTransaction();

    // Step 9: Real-time notification (outside transaction)
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${bid.freelancerId}`).emit('hired', {
        bidId: bid._id,
        gigId: bid.gigId,
        gigTitle: gig.title,
        message: `Congratulations! You've been hired for ${gig.title}`,
      });
    }

    // Step 10: Success response
    res.json({
      message: 'Freelancer hired successfully!',
      bid: {
        _id: bidId,
        status: 'hired',
      },
    });
  } catch (error) {
    // If anything fails, abort transaction
    await session.abortTransaction();
    next(error);
  } finally {
    // Always close session
    await session.endSession();
  }
};
```

## When Hiring Fails

The client receives one of these errors:

| Error | Cause | User Message |
|-------|-------|--------------|
| `Bid not found` | Bid was deleted | "This bid no longer exists" |
| `Gig not found` | Gig was deleted | "This gig no longer exists" |
| `Not authorized` | User doesn't own gig | "You don't own this gig" |
| `Already assigned` | Another user hired someone | "This gig has already been assigned" |
| `Not available` | Bid was already hired/rejected | "This bid is no longer available" |

## Why This Matters

Without transactions:
- 💥 Multiple freelancers could end up "hired"
- 💥 Bids could have inconsistent status
- 💥 A gig could show as open while assigned
- 💥 Money/contracts could be double-counted

With transactions:
- ✅ Exactly one freelancer per gig
- ✅ All related records update together
- ✅ Race conditions impossible
- ✅ Data integrity guaranteed

## Limitations & Future Improvements

Current:
- ✅ Prevents duplicate hires
- ✅ Rejects all other bids atomically

Future:
- 💰 Payment integration (Stripe transactions)
- 📝 Contract signing (e-signature service)
- 💬 Dispute resolution (escrow logic)
- 📊 Analytics (transaction logging)

---

This is the heart of GigFlow's reliability. It's what separates a toy project from something production-ready.
