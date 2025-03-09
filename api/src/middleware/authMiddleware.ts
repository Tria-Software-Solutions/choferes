import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

const SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error("Missing JWT_SECRET_KEY in environment variables");
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token required" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Unauthorized: Token expired" });
        }
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      const payload = decoded as JwtPayload;

      if (!payload.userId) {
        return res
          .status(403)
          .json({ error: "Forbidden: Invalid token payload" });
      }

      req.user = { id: payload.userId };
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
