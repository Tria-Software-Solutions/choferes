import express from "express";
import * as meController from "../controllers/meController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  myLicenseRequestRules,
  myProfileRules,
  myVacationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

// Autoservicio: exige el permiso correspondiente (concedido a todos los roles
// base). El servicio deriva el empleado de users.employeeId, así que nunca se
// acepta un id de empleado desde el cliente.
router.get(
  "/overview",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_MY_PANEL),
  meController.getMyOverview,
);
router.post(
  "/vacations",
  authenticateToken,
  requirePermission(PERMISSION_CODES.REQUEST_VACATION),
  myVacationRules,
  validate,
  meController.createMyVacation,
);

// El empleado mantiene al día sus propios datos personales. El servicio filtra
// por lista blanca: nunca se toca puesto, contrato ni compensación. Basta con
// poder abrir el panel (`my-panel:view`): el empleado se resuelve de la sesión,
// así que estas rutas solo alcanzan la ficha propia.
router.put(
  "/profile",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_MY_PANEL),
  myProfileRules,
  validate,
  meController.updateMyProfile,
);

// Documentos del empleado: el ámbito compartido y el de su propia ficha. La
// página administrativa de Documentos no está disponible para él.
router.get(
  "/documents",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_MY_PANEL),
  meController.getMyDocuments,
);

// Cambios de licencia propuestos por el empleado: quedan pendientes de revisión
// y no escriben la licencia real hasta que administración los aprueba.
router.get(
  "/licenses/requests",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_MY_PANEL),
  meController.getMyLicenseRequests,
);
router.post(
  "/licenses/requests",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_MY_PANEL),
  myLicenseRequestRules,
  validate,
  meController.createMyLicenseRequest,
);

export default router;
