import express from "express";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, roleController.getRoles);
router.get("/:id", authenticateToken, roleController.getRoleById);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Super Administrador"]),
  roleController.createRole
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador"]),
  roleController.deleteRole
);

export default router;
