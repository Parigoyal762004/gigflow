import express from 'express';
import {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getMyGigs,
} from '../controllers/gigController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createGig);
router.get('/my/gigs', authenticate, getMyGigs);
router.get('/', optionalAuth, getGigs);
router.get('/:gigId', optionalAuth, getGigById);
router.patch('/:gigId', authenticate, updateGig);
router.delete('/:gigId', authenticate, deleteGig);

export default router;
