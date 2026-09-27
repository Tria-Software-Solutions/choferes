import express from "express";
import * as disciplinaryController from "../controllers/disciplinaryActionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  disciplinaryRules,
  disciplinaryUpdateRules,
  disciplinaryQueryRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_DISCIPLINARY),
  disciplinaryQueryRules,
  validate,
  disciplinaryController.getDisciplinaryActions,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_DISCIPLINARY),
  idParam,
  validate,
  disciplinaryController.getDisciplinaryActionById,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_DISCIPLINARY),
  disciplinaryRules,
  validate,
  disciplinaryController.createDisciplinaryAction,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_DISCIPLINARY),
  idParam,
  disciplinaryUpdateRules,
  validate,
  disciplinaryController.updateDisciplinaryAction,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_DISCIPLINARY),
  idParam,
  validate,
  disciplinaryController.deleteDisciplinaryAction,
);

export default router;
