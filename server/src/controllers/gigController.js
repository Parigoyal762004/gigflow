import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';

export const createGig = async (req, res, next) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.userId,
    });

    res.status(201).json({
      message: 'Gig created successfully',
      gig,
    });
  } catch (error) {
    next(error);
  }
};

export const getGigs = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = { status: 'open' };

    if (search) {
      query.$text = { $search: search };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      gigs,
      total: gigs.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getGigById = async (req, res, next) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId).populate('ownerId', 'name email');

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Count bids
    const bidCount = await Bid.countDocuments({ gigId });

    res.json({
      gig: {
        ...gig.toObject(),
        bidCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGig = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    const { title, description, budget } = req.body;

    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this gig' });
    }

    if (gig.status === 'assigned') {
      return res.status(400).json({ error: 'Cannot update an assigned gig' });
    }

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (budget) gig.budget = budget;

    await gig.save();

    res.json({
      message: 'Gig updated successfully',
      gig,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGig = async (req, res, next) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this gig' });
    }

    if (gig.status === 'assigned') {
      return res.status(400).json({ error: 'Cannot delete an assigned gig' });
    }

    // Delete all associated bids
    await Bid.deleteMany({ gigId });

    await Gig.findByIdAndDelete(gigId);

    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ ownerId: req.userId })
      .sort({ createdAt: -1 });

    const gigsWithStats = await Promise.all(
      gigs.map(async (gig) => {
        const bidCount = await Bid.countDocuments({ gigId: gig._id });
        return {
          ...gig.toObject(),
          bidCount,
        };
      })
    );

    res.json({
      gigs: gigsWithStats,
    });
  } catch (error) {
    next(error);
  }
};
