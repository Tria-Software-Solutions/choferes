import express from "express";
import * as vehicleController from "../controllers/vehicleController";

const router = express.Router();

router.post("/", vehicleController.createVehicle);
router.get("/", vehicleController.getAllVehicles);
router.get("/by-date", vehicleController.getVehiclesByDate);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

export default router;
