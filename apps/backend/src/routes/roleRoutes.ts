import express from "express";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  idParam,
  roleRules,
  roleUpdateRules,
  roleNameParam,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, roleController.getRoles);
router.get("/:id", authenticateToken, idParam, validate, roleController.getRoleById);
router.get("/name/:name", authenticateToken, roleNameParam, validate, roleController.getRoleByName);
router.post("/", authenticateToken, roleRules, validate, roleController.createRole);
router.put("/:id", authenticateToken, roleUpdateRules, validate, roleController.updateRole);
router.delete("/:id", authenticateToken, idParam, validate, roleController.deleteRole);

export default router;
