import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

export const authorizeRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated user" });
    }

    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ error: "Access denied. You do not have enough permissions." });
    }

    next();
  };
};
