// Controller for handling health check requests for the application
import { Request, Response } from "express";
import checkHealth from "../services/healthService";

// Health controller for application health checks
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const healthStatus = await checkHealth();
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Returns the health status of the application
export default {
  healthCheck,
};
