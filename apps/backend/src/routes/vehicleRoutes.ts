import express from "express";
import * as vehicleController from "../controllers/vehicleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  vehicleRules,
  vehicleUpdateRules,
  vehicleDateQuery,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_VEHICLES),
  paginationRules,
  validate,
  vehicleController.getVehicles,
);
router.get(
  "/by-date",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_VEHICLES),
  vehicleDateQuery,
  validate,
  vehicleController.getVehiclesByDate,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_VEHICLES),
  idParam,
  validate,
  vehicleController.getVehicleById,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_VEHICLES),
  vehicleRules,
  validate,
  vehicleController.createVehicle,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_VEHICLES),
  vehicleUpdateRules,
  validate,
  vehicleController.updateVehicle,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_VEHICLES),
  idParam,
  validate,
  vehicleController.deleteVehicle,
);

export default router;
