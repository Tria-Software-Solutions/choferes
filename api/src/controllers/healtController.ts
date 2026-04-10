// Controller for handling health check requests for the application
import { Request, Response } from "express";

// Simple health check - minimal, no dependencies
export const healthCheck = async (req: Request, res: Response) => {
  // Always return 200 OK - this is for Render wake-up monitoring
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Server is running",
  });
};

// Returns the health status of the application
export default {
  healthCheck,
};
