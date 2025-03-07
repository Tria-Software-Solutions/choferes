import express from "express";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, roleController.getRoles);
router.get("/:id", authenticateToken, roleController.getRoleById);
router.post(
  "/",
  authenticateToken,
  authorizeRole([Roles.MANAGER]),
  roleController.createRole
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER]),
  roleController.deleteRole
);

export default router;
