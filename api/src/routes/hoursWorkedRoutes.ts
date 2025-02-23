import express from 'express';
import * as hoursWorkedController from '../controllers/hoursWorkedController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, hoursWorkedController.createHoursWorked);
router.get('/', authenticateToken, hoursWorkedController.getAllHoursWorked);
router.get('/:id', authenticateToken, hoursWorkedController.getHoursWorkedById);
router.put('/:id', authenticateToken, hoursWorkedController.updateHoursWorked);
router.delete('/:id', authenticateToken, hoursWorkedController.deleteHoursWorked);

export default router;
