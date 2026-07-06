import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/admin', adminMiddleware, getAllOrdersAdmin);
router.get('/:id', getOrderById);
router.put('/:id/status', adminMiddleware, updateOrderStatus);

export default router;
