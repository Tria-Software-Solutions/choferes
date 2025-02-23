import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(403).json({ error: "Required token" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user as { id: number; role: string };
    next();
  });
};
