import express from "express";
import * as vehicleController from "../controllers/vehicleController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  idParam,
  vehicleRules,
  vehicleUpdateRules,
  vehicleDateQuery,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, vehicleController.getVehicles);
router.get(
  "/by-date",
  authenticateToken,
  vehicleDateQuery,
  validate,
  vehicleController.getVehiclesByDate,
);
router.get("/:id", authenticateToken, idParam, validate, vehicleController.getVehicleById);
router.post("/", authenticateToken, vehicleRules, validate, vehicleController.createVehicle);
router.put(
  "/:id",
  authenticateToken,
  vehicleUpdateRules,
  validate,
  vehicleController.updateVehicle,
);
router.delete("/bulk", authenticateToken, vehicleController.deleteAllVehicles);
router.delete("/:id", authenticateToken, idParam, validate, vehicleController.deleteVehicle);

export default router;
