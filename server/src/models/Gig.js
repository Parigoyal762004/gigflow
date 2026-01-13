import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a gig title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    budget: {
      type: Number,
      required: [true, 'Please provide a budget'],
      min: [1, 'Budget must be at least 1'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'assigned'],
      default: 'open',
    },
    hiringBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
gigSchema.index({ title: 'text', description: 'text' });
gigSchema.index({ ownerId: 1 });
gigSchema.index({ status: 1 });

export default mongoose.model('Gig', gigSchema);
