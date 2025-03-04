import express from 'express';
import * as biweeklySummaryController from '../controllers/biweeklySummaryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get('/', authenticateToken, biweeklySummaryController.getBiweeklySummaries);
// router.get('/:id', authenticateToken, biweeklySummaryController.getBiweeklySummaryById);
// router.post('/', authenticateToken, biweeklySummaryController.createBiweeklySummary);
// router.put('/:id', authenticateToken, biweeklySummaryController.updateBiweeklySummary);
// router.delete('/:id', authenticateToken, biweeklySummaryController.deleteBiweeklySummary);

router.get('/', biweeklySummaryController.getBiweeklySummaries);
router.get('/:id', biweeklySummaryController.getBiweeklySummaryById);
router.post('/', biweeklySummaryController.createBiweeklySummary);
router.put('/:id', biweeklySummaryController.updateBiweeklySummary);
router.delete('/:id', biweeklySummaryController.deleteBiweeklySummary);

export default router;