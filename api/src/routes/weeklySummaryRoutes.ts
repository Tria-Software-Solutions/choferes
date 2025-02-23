import express from 'express';
import * as weeklySummaryController from '../controllers/weeklySummaryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, weeklySummaryController.createWeeklySummary);
router.get('/', authenticateToken, weeklySummaryController.getAllWeeklySummaries);
router.get('/:id', authenticateToken, weeklySummaryController.getWeeklySummaryById);
router.put('/:id', authenticateToken, weeklySummaryController.updateWeeklySummary);
router.delete('/:id', authenticateToken, weeklySummaryController.deleteWeeklySummary);

export default router;
