import express from "express";
import * as healthController from "../controllers/healtController";

const router = express.Router();

router.get("/", healthController.healthCheck);

export default router;
