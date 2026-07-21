// Middleware to restrict access to routes based on user roles
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number; roles?: Array<{ name: string }> };
}

// Returns middleware that checks if the user has at least one of the required roles
const roleMiddleware =
  (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated user" });
    }

    const userRoles = req.user.roles?.map((role) => role.name) || [];

    const hasRequiredRole = roles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    return next();
  };

export default roleMiddleware;
