// Middleware to restrict access to routes based on user roles.
// Note: the app authorizes via permissions (see ./authorize). This middleware
// is kept for role-based checks and expects req.user.roles as string[].
import { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authorize";

// Returns middleware that checks if the user has at least one of the required roles
const roleMiddleware = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: authentication required" });
  }

  const hasRequiredRole = roles.some(
    (role) => user.roles.includes("*") || user.roles.includes(role),
  );

  if (!hasRequiredRole) {
    return res.status(403).json({ error: "Forbidden: insufficient roles" });
  }

  return next();
};

export default roleMiddleware;
