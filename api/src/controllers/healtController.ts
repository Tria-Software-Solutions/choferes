import { Request, Response } from "express";
import { checkHealth } from "../services/healthService";

export const healthCheck = (req: Request, res: Response) => {
  const healthStatus = checkHealth();
  res.status(200).json(healthStatus);
};