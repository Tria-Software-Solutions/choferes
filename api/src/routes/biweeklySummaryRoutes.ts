import express from 'express';
import * as biweeklySummaryController from '../controllers/biweeklySummaryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, biweeklySummaryController.createBiweeklySummary);
router.get('/', authenticateToken, biweeklySummaryController.getAllBiweeklySummaries);
router.get('/:id', authenticateToken, biweeklySummaryController.getBiweeklySummaryById);
router.put('/:id', authenticateToken, biweeklySummaryController.updateBiweeklySummary);
router.delete('/:id', authenticateToken, biweeklySummaryController.deleteBiweeklySummary);

export default router;