// Authorization middleware built on top of authenticateToken.
// authenticateToken sets req.user = { id, roles: string[], permissions: string[] },
// where `permissions` holds stable permission CODES (e.g. "employees:view"), not
// the Spanish display labels. Route guards therefore use PERMISSION_CODES.*.
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedUser {
  id: number;
  roles: string[];
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const getUserId = (req: Request): number | undefined => (req as AuthenticatedRequest).user?.id;

const hasPermission = (user: AuthenticatedUser, permission: string): boolean => {
  if (user.permissions.includes("*")) {
    return true;
  }
  return user.permissions.includes(permission);
};

// Require the current user to hold at least one of the given permissions.
export const requireAnyPermission =
  (permissions: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: authentication required" });
    }
    const allowed = permissions.some((permission) => hasPermission(user, permission));
    if (!allowed) {
      return res.status(403).json({
        error: "Forbidden: insufficient permissions",
        requiredPermissions: permissions,
      });
    }
    return next();
  };

// Require the current user to hold the given permission (bitw-se of the above).
export const requirePermission =
  (permission: string) => (req: Request, res: Response, next: NextFunction) =>
    requireAnyPermission([permission])(req, res, next);

// Require at least one of the given roles.
export const requireRole =
  (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: authentication required" });
    }
    const allowed = roles.some((role) => user.roles.includes("*") || user.roles.includes(role));
    if (!allowed) {
      return res.status(403).json({ error: "Forbidden: insufficient roles" });
    }
    return next();
  };

// Allow the current user to act on their own resource when they hold the
// self-service permission, or on any resource when they hold the management
// permission. Use for account endpoints (profile, password, settings, avatar).
export const allowSelfWithPermission =
  (selfPermission: string, otherPermission: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: authentication required" });
    }
    const targetId = parseInt(req.params.id, 10);
    const isSelf = Number.isInteger(targetId) && targetId === user.id;
    const allowed = isSelf
      ? hasPermission(user, selfPermission)
      : hasPermission(user, otherPermission);
    if (!allowed) {
      return res.status(403).json({
        error: isSelf
          ? "Forbidden: insufficient permissions on your own account"
          : "Forbidden: cannot act on another user's resource without permission",
      });
    }
    return next();
  };

// Allow "self" (req.user.id === req.params.id) or a permission holder.
// Use for routes that support profile self-service plus admin management.
export const allowSelfOrPermission =
  (permission: string) => (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: authentication required" });
    }
    const targetId = parseInt(req.params.id, 10);
    if (Number.isInteger(targetId) && targetId === user.id) {
      return next();
    }
    if (hasPermission(user, permission)) {
      return next();
    }
    return res.status(403).json({
      error: "Forbidden: cannot act on another user's resource without permission",
    });
  };

export { getUserId };
