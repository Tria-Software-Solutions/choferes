import express from "express";
import * as paymentController from "../controllers/paymentController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  paymentRules,
  paymentUpdateRules,
  paymentQueryRules,
  paymentEmailRules,
  paymentGenerateRules,
  biweekParams,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_PAYMENTS),
  paymentQueryRules,
  validate,
  paymentController.getPayments,
);
router.get(
  "/recalculate/:employeeId/:biweekNumber/:year",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_PAYMENTS),
  biweekParams,
  validate,
  paymentController.previewBreakdown,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_PAYMENTS),
  idParam,
  validate,
  paymentController.getPaymentById,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_PAYMENT),
  paymentRules,
  validate,
  paymentController.createPayment,
);
router.post(
  "/generate",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_PAYMENT),
  paymentGenerateRules,
  validate,
  paymentController.generatePeriodPayments,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_PAYMENT),
  paymentUpdateRules,
  validate,
  paymentController.updatePayment,
);
router.post(
  "/:id/recalculate",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_PAYMENT),
  idParam,
  validate,
  paymentController.recalculatePayment,
);
router.post(
  "/:id/email",
  authenticateToken,
  requirePermission(PERMISSION_CODES.SEND_PAYMENT_EMAIL),
  paymentEmailRules,
  validate,
  paymentController.sendPaymentEmail,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_PAYMENT),
  idParam,
  validate,
  paymentController.deletePayment,
);

export default router;
