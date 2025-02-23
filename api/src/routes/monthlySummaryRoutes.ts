import express from 'express';
import * as monthlySummaryController from '../controllers/monthlySummaryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, monthlySummaryController.createMonthlySummary);
router.get('/', authenticateToken, monthlySummaryController.getAllMonthlySummaries);
router.get('/:id', authenticateToken, monthlySummaryController.getMonthlySummaryById);
router.put('/:id', authenticateToken, monthlySummaryController.updateMonthlySummary);
router.delete('/:id', authenticateToken, monthlySummaryController.deleteMonthlySummary);

export default router;
