import express from 'express';
import * as employeeController from '../controllers/employeeController';
import { authenticateToken } from '../middleware/authMiddleware';
//import { authorizeRole } from '../middleware/roleMiddleware'; 

const router = express.Router();

//router.post('/', authenticateToken, authorizeRole('admin'), employeeController.createEmployee);
router.get('/', authenticateToken, employeeController.getEmployees);
router.get('/:id', authenticateToken, employeeController.getEmployeeById);
router.post('/', authenticateToken, employeeController.createEmployee);
router.put('/:id', authenticateToken, employeeController.updateEmployee);
router.delete('/:id', authenticateToken, employeeController.deleteEmployee);

export default router;
