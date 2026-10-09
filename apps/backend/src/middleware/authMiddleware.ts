// Middleware for authenticating and refreshing JWT tokens for protected routes
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { clearAuthCookies, generateTokens } from "../utils/generateSecret";
import { runAsActor } from "../utils/actorContext";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import type { AuthenticatedUser } from "./authorize";

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const { JWT_SECRET_KEY } = process.env;
const { JWT_SECRET_KEY_REFRESH } = process.env;

if (!JWT_SECRET_KEY || !JWT_SECRET_KEY_REFRESH) {
  throw new Error("Missing JWT secret keys in environment variables");
}

const verifyToken = (token: string, secret: string): Promise<JwtPayload> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(decoded as JwtPayload);
    });
  });

const mapVerifyError = (error: unknown): { status: number; error: string; code: string } => {
  if (error instanceof Error) {
    if (error.name === "TokenExpiredError") {
      return { status: 401, error: "Unauthorized: Token expired", code: "TOKEN_EXPIRED" };
    }
    if (error.name === "JsonWebTokenError") {
      return { status: 401, error: "Unauthorized: Invalid token", code: "INVALID_TOKEN" };
    }
  }
  return {
    status: 401,
    error: "Unauthorized: Token verification failed",
    code: "TOKEN_VERIFICATION_FAILED",
  };
};

// Middleware to authenticate access tokens from Authorization header or cookies.
// Resolves the user from the database (acts as a server-side revocation check),
// verifies the account is active and attaches { id, roles, permissions } to req.user.
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    let accessToken: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Fallback to cookies
      accessToken = req.cookies?.accessToken || null;
    }

    if (!accessToken) {
      return res.status(401).json({
        error: "Unauthorized: Access token required",
        code: "MISSING_TOKEN",
      });
    }

    let payload: JwtPayload;
    try {
      payload = await verifyToken(accessToken, JWT_SECRET_KEY);
    } catch (error) {
      const mapped = mapVerifyError(error);
      return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });
    }

    if (!payload.userId || typeof payload.userId !== "string") {
      return res.status(403).json({
        error: "Forbidden: Invalid token payload",
        code: "INVALID_PAYLOAD",
      });
    }

    const userId = parseInt(payload.userId, 10);
    const user = await User.findByPk(userId, {
      attributes: ["id", "isActive", "tokenVersion"],
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: "permissions",
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized: User no longer exists",
        code: "USER_UNAVAILABLE",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Forbidden: Account disabled",
        code: "ACCOUNT_DISABLED",
      });
    }

    // Session revocation: tokens issued before the last password change carry
    // an older `ver`, so they are rejected here even though the signature is valid.
    const tokenVersion = typeof payload.ver === "number" ? payload.ver : 0;
    if (tokenVersion !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({
        error: "Unauthorized: Session revoked",
        code: "TOKEN_REVOKED",
      });
    }

    const roles = (user.roles ?? []).map((role) => role.name);
    // Authorize against the stable permission CODE, never the Spanish label.
    // Labels are display-only and may change without breaking access control.
    const permissions = (user.roles ?? []).flatMap((role) =>
      (role.permissions ?? []).map((permission) => permission.code),
    );

    req.user = { id: userId, roles, permissions };
    // El resto de la petición corre "como" este usuario (ver utils/actorContext).
    return runAsActor(userId, () => next());
  } catch {
    return res.status(500).json({
      error: "Internal server error",
      code: "AUTH_ERROR",
    });
  }
};

// Middleware to authenticate and refresh refresh tokens.
// Reads the refresh token from the Authorization header first (the frontend
// always sends it there), falling back to the httpOnly cookie. This makes the
// refresh flow resilient to browsers that block third-party cookies on
// cross-site requests (frontend on Vercel, API on Render).
//
// New tokens are only issued while the account still exists and is active, so
// deleting or disabling a user also ends their session at the next refresh.
export const authenticateRefreshToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let refreshToken: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      refreshToken = authHeader.substring(7);
    } else {
      refreshToken = req.cookies?.refreshToken || null;
    }

    if (!refreshToken) {
      return res.status(401).json({
        error: "Unauthorized: Refresh token required",
        code: "MISSING_REFRESH_TOKEN",
      });
    }

    let payload: JwtPayload;
    try {
      payload = await verifyToken(refreshToken, JWT_SECRET_KEY_REFRESH);
    } catch (refreshErr) {
      if (refreshErr instanceof Error && refreshErr.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Unauthorized: Refresh token expired",
          code: "REFRESH_TOKEN_EXPIRED",
        });
      }
      return res.status(403).json({
        error: "Forbidden: Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    const { userId } = payload;
    if (!userId || typeof userId !== "string") {
      return res.status(403).json({
        error: "Forbidden: Invalid refresh token payload",
        code: "INVALID_REFRESH_PAYLOAD",
      });
    }

    const user = await User.findByPk(parseInt(userId, 10), {
      attributes: ["id", "isActive", "tokenVersion"],
    });
    if (!user || !user.isActive) {
      clearAuthCookies(res);
      return res.status(401).json({
        error: "Unauthorized: Account unavailable",
        code: "USER_UNAVAILABLE",
      });
    }

    // A password change bumps tokenVersion; refuse to mint fresh tokens from a
    // refresh token that predates it.
    const tokenVersion = typeof payload.ver === "number" ? payload.ver : 0;
    if (tokenVersion !== (user.tokenVersion ?? 0)) {
      clearAuthCookies(res);
      return res.status(401).json({
        error: "Unauthorized: Session revoked",
        code: "TOKEN_REVOKED",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
      userId,
      res,
      user.tokenVersion ?? 0,
    );

    res.setHeader("x-access-token", newAccessToken);
    res.setHeader("x-refresh-token", newRefreshToken);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      message: "Tokens refreshed successfully",
    });
  } catch {
    return res.status(500).json({
      error: "Internal server error",
      code: "REFRESH_ERROR",
    });
  }
};

// Ends the session: expires the httpOnly auth cookies. Tokens held in memory
// by the client are discarded client-side; this handler needs no valid token
// so an already-expired session can still be closed cleanly.
export const logout = (_req: Request, res: Response) => {
  clearAuthCookies(res);
  return res.status(204).end();
};
