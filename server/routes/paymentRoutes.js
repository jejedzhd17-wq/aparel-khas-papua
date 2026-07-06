import express from 'express';
import {
  createPayment,
  getPaymentByOrderId,
  uploadProof,
  verifyPayment,
  getAllPaymentsAdmin
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { uploadPaymentProof } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createPayment);
router.post('/upload-proof', uploadPaymentProof, uploadProof);
router.get('/admin', adminMiddleware, getAllPaymentsAdmin);
router.get('/:orderId', getPaymentByOrderId);
router.put('/:orderId/verify', adminMiddleware, verifyPayment);

export default router;
