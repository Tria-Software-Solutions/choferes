import express from 'express';
import * as scheduleController from '../controllers/scheduleController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, scheduleController.createSchedule);
router.get('/', authenticateToken, scheduleController.getAllSchedules);
router.get('/:id', authenticateToken, scheduleController.getScheduleById);
router.put('/:id', authenticateToken, scheduleController.updateSchedule);
router.delete('/:id', authenticateToken, scheduleController.deleteSchedule);

export default router;