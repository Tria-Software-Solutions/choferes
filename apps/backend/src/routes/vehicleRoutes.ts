import express from "express";
import * as vehicleController from "../controllers/vehicleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSIONS } from "../constants/permissions";
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
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.CREATE_VEHICLE),
  vehicleRules,
  validate,
  vehicleController.createVehicle,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_VEHICLE),
  vehicleUpdateRules,
  validate,
  vehicleController.updateVehicle,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.DELETE_VEHICLE),
  idParam,
  validate,
  vehicleController.deleteVehicle,
);

export default router;
