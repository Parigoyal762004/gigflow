import express from 'express';
import {
  submitBid,
  getBidsForGig,
  getMyBids,
  hireBidder,
} from '../controllers/bidController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, submitBid);
router.get('/my/bids', authenticate, getMyBids);
router.patch('/:bidId/hire', authenticate, hireBidder);
router.get('/:gigId', authenticate, getBidsForGig);

export default router;
