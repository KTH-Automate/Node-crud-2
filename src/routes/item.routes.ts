import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from '../controllers/item.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all CRUD routes
router.use(authenticateToken);

// /api/items
router.post('/', createItem as any);
router.get('/', getItems as any);
router.get('/:id', getItemById as any);
router.put('/:id', updateItem as any);
router.delete('/:id', deleteItem as any);

export default router;
