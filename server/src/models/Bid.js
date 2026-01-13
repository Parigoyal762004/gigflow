import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message with your bid'],
      maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [1, 'Price must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'hired', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bids from same freelancer on same gig
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });
bidSchema.index({ gigId: 1 });
bidSchema.index({ freelancerId: 1 });

export default mongoose.model('Bid', bidSchema);
