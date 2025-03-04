import express from "express";
import * as vehicleController from "../controllers/vehicleController";
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get("/", authenticateToken, vehicleController.getVehicles);
// router.get("/by-date", authenticateToken, vehicleController.getVehiclesByDate);
// router.get("/:id", authenticateToken, vehicleController.getVehicleById);
// router.post("/", authenticateToken, vehicleController.createVehicle);
// router.put("/:id", authenticateToken, vehicleController.updateVehicle);
// router.delete("/:id", authenticateToken, vehicleController.deleteVehicle);

router.get("/", vehicleController.getVehicles);
router.get("/by-date", vehicleController.getVehiclesByDate);
router.get("/:id", vehicleController.getVehicleById);
router.post("/", vehicleController.createVehicle);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

export default router;
