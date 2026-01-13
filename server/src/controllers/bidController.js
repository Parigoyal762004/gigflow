import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import mongoose from 'mongoose';

export const submitBid = async (req, res, next) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || price === undefined) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    if (gig.status === 'assigned') {
      return res.status(400).json({ error: 'This gig has already been assigned' });
    }

    // Check if freelancer already bid on this gig
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.userId,
    });

    if (existingBid) {
      return res.status(400).json({ error: 'You have already bid on this gig' });
    }

    // Prevent freelancer from bidding on their own gig
    if (gig.ownerId.toString() === req.userId) {
      return res.status(400).json({ error: 'You cannot bid on your own gig' });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.userId,
      message,
      price,
    });

    res.status(201).json({
      message: 'Bid submitted successfully',
      bid,
    });
  } catch (error) {
    next(error);
  }
};

export const getBidsForGig = async (req, res, next) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Only owner can view bids
    if (gig.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view these bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      gig: {
        id: gig._id,
        title: gig.title,
        budget: gig.budget,
        status: gig.status,
      },
      bids,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.userId })
      .populate('gigId', 'title budget status')
      .sort({ createdAt: -1 });

    res.json({
      bids,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Hire a freelancer for a gig
 * This is the critical hiring logic that uses MongoDB transactions to ensure atomicity
 * and prevent race conditions
 */
export const hireBidder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Fetch the bid
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Fetch the gig
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Check authorization: only the gig owner can hire
    if (gig.ownerId.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Not authorized to hire for this gig' });
    }

    // Prevent hiring if already assigned
    if (gig.status === 'assigned') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'This gig has already been assigned' });
    }

    // Prevent hiring if bid is already hired or rejected
    if (bid.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'This bid is no longer available' });
    }

    // ATOMIC UPDATES: All these happen together or not at all
    // 1. Update the chosen bid to "hired"
    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { new: true, session }
    );

    // 2. Reject all other bids for this gig
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId } },
      { status: 'rejected' },
      { session }
    );

    // 3. Mark the gig as "assigned" and track which bid hired it
    await Gig.findByIdAndUpdate(
      bid.gigId,
      { status: 'assigned', hiringBidId: bidId },
      { new: true, session }
    );

    await session.commitTransaction();

    // After successful transaction, emit real-time notification
    // This happens outside the transaction scope
    const io = req.app.get('io');
    if (io) {
      // Emit to the freelancer's socket room
      io.to(`user:${bid.freelancerId}`).emit('hired', {
        bidId: bid._id,
        gigId: bid.gigId,
        gigTitle: gig.title,
        message: `Congratulations! You've been hired for ${gig.title}`,
      });
    }

    res.json({
      message: 'Freelancer hired successfully!',
      bid: {
        _id: bidId,
        status: 'hired',
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};
