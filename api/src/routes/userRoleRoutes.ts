import express from 'express';
import * as userRoleController from '../controllers/userRoleController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/assign', authenticateToken, userRoleController.assignRole);
router.get('/:userId', authenticateToken, userRoleController.getRoles);
router.delete('/remove', authenticateToken, userRoleController.removeRole);

export default router;
