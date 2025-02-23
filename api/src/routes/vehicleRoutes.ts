import express from "express";
import * as vehicleController from "../controllers/vehicleController";
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post("/", authenticateToken, vehicleController.createVehicle);
router.get("/", authenticateToken, vehicleController.getAllVehicles);
router.get("/by-date", authenticateToken, vehicleController.getVehiclesByDate);
router.get("/:id", authenticateToken, vehicleController.getVehicleById);
router.put("/:id", authenticateToken, vehicleController.updateVehicle);
router.delete("/:id", authenticateToken, vehicleController.deleteVehicle);

export default router;
