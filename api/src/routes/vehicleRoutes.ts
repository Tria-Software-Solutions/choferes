import express from "express";
import * as vehicleController from "../controllers/vehicleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, vehicleController.getVehicles);
router.get("/by-date", authenticateToken, vehicleController.getVehiclesByDate);
router.get("/:id", authenticateToken, vehicleController.getVehicleById);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  vehicleController.createVehicle
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  vehicleController.updateVehicle
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  vehicleController.deleteVehicle
);

export default router;
