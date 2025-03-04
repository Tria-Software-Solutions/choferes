import express from 'express';
import * as hoursWorkedController from '../controllers/hoursWorkedController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get('/', authenticateToken, hoursWorkedController.getHoursWorked);
// router.get('/:id', authenticateToken, hoursWorkedController.getHoursWorkedById);
// router.post('/', authenticateToken, hoursWorkedController.createHoursWorked);
// router.put('/:id', authenticateToken, hoursWorkedController.updateHoursWorked);
// router.delete('/:id', authenticateToken, hoursWorkedController.deleteHoursWorked);

router.get('/', hoursWorkedController.getHoursWorked);
router.get('/:id', hoursWorkedController.getHoursWorkedById);
router.post('/', hoursWorkedController.createHoursWorked);
router.put('/:id', hoursWorkedController.updateHoursWorked);
router.delete('/:id', hoursWorkedController.deleteHoursWorked);

export default router;
