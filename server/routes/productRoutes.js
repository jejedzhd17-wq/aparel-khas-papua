import express from 'express';
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin only CRUD + Image upload
router.post('/', authMiddleware, adminMiddleware, uploadProductImage, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, uploadProductImage, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
