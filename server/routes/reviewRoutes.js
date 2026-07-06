import express from 'express';
import { getReviews, createReview, deleteReview } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', authMiddleware, createReview); // reviewer harus login dan id diambil dari token

router.delete('/:id', authMiddleware, adminMiddleware, deleteReview);

export default router;
