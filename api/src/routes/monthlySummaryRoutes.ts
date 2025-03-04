import express from 'express';
import * as monthlySummaryController from '../controllers/monthlySummaryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get('/', authenticateToken, monthlySummaryController.getMonthlySummaries);
// router.get('/:id', authenticateToken, monthlySummaryController.getMonthlySummaryById);
// router.post('/', authenticateToken, monthlySummaryController.createMonthlySummary);
// router.put('/:id', authenticateToken, monthlySummaryController.updateMonthlySummary);
// router.delete('/:id', authenticateToken, monthlySummaryController.deleteMonthlySummary);

router.get('/', monthlySummaryController.getMonthlySummaries);
router.get('/:id', monthlySummaryController.getMonthlySummaryById);
router.post('/', monthlySummaryController.createMonthlySummary);
router.put('/:id', monthlySummaryController.updateMonthlySummary);
router.delete('/:id', monthlySummaryController.deleteMonthlySummary);

export default router;
