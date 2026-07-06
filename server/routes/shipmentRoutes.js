import express from 'express';
import {
  getUserShipments,
  getShipmentById,
  trackShipmentByResi,
  getAllShipmentsAdmin,
  createShipment,
  updateShipment,
  deleteShipment
} from '../controllers/shipmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Lacak resi publik (tanpa login)
router.get('/track/:trackingNumber', trackShipmentByResi);

// Proteksi JWT untuk lainnya
router.use(authMiddleware);

router.get('/', getUserShipments);
router.get('/admin', adminMiddleware, getAllShipmentsAdmin);
router.get('/:id', getShipmentById);

// Admin only CRUD
router.post('/', adminMiddleware, createShipment);
router.put('/:id', adminMiddleware, updateShipment);
router.delete('/:id', adminMiddleware, deleteShipment);

export default router;
