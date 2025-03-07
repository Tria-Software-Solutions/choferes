import express from "express";
import * as vehicleController from "../controllers/vehicleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, vehicleController.getVehicles);
router.get("/by-date", authenticateToken, vehicleController.getVehiclesByDate);
router.get("/:id", authenticateToken, vehicleController.getVehicleById);
router.post(
  "/",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  vehicleController.createVehicle
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  vehicleController.updateVehicle
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  vehicleController.deleteVehicle
);

export default router;
