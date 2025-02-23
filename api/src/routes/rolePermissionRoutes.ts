import express from 'express';
import * as rolePermissionController from '../controllers/rolePermissionController';
import { authenticateToken } from '../middleware/authMiddleware'; 

const router = express.Router();

router.post('/assign', authenticateToken, rolePermissionController.assignPermission);
router.get('/:roleId', authenticateToken, rolePermissionController.getPermissions);
router.delete('/remove', authenticateToken, rolePermissionController.removePermission);

export default router;
