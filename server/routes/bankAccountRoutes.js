import express from 'express';
import {
  getAllBankAccounts,
  getAllBankAccountsAdmin,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from '../controllers/bankAccountController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Publik — untuk PaymentGateway user
router.get('/', getAllBankAccounts);

// Admin only
router.get('/admin', authMiddleware, adminMiddleware, getAllBankAccountsAdmin);
router.post('/', authMiddleware, adminMiddleware, createBankAccount);
router.put('/:id', authMiddleware, adminMiddleware, updateBankAccount);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBankAccount);

export default router;
