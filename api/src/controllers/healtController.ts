// Controller for handling health check requests for the application
import { Request, Response } from "express";
import checkHealth from "../services/healthService";

// Health check that validates the app and the database are ready.
export const healthCheck = async (req: Request, res: Response) => {
  const health = await checkHealth();
  return res.status(health.status === "OK" ? 200 : 503).json(health);
};

// Returns the health status of the application
export default {
  healthCheck,
};
