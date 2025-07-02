import { Request, Response } from "express";
import checkHealth from "../services/healthService";

// Health controller for application health checks
export const healthCheck = (req: Request, res: Response) => {
  const healthStatus = checkHealth();
  res.status(200).json(healthStatus);
};

// Returns the health status of the application
export default {
  healthCheck,
};
