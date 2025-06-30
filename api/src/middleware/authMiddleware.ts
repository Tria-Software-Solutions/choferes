import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { generateTokens } from "../utils/generateSecret";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

const { JWT_SECRET_KEY } = process.env;
const { JWT_SECRET_KEY_REFRESH } = process.env;

if (!JWT_SECRET_KEY || !JWT_SECRET_KEY_REFRESH) {
  throw new Error("Missing JWT secret keys in environment variables");
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({
        error: "Unauthorized: Access token required",
        code: "MISSING_TOKEN",
      });
    }

    return jwt.verify(accessToken, JWT_SECRET_KEY, (error, decoded) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({
            error: "Unauthorized: Token expired",
            code: "TOKEN_EXPIRED",
          });
        }
        if (error.name === "JsonWebTokenError") {
          return res.status(401).json({
            error: "Unauthorized: Invalid token",
            code: "INVALID_TOKEN",
          });
        }
        return res.status(401).json({
          error: "Unauthorized: Token verification failed",
          code: "TOKEN_VERIFICATION_FAILED",
        });
      }

      const payload = decoded as JwtPayload;

      if (!payload.userId || typeof payload.userId !== "string") {
        return res.status(403).json({
          error: "Forbidden: Invalid token payload",
          code: "INVALID_PAYLOAD",
        });
      }

      req.user = { id: parseInt(payload.userId, 10) };
      return next();
    });
  } catch (error) {
    console.error(
      "Authentication error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return res.status(500).json({
      error: "Internal server error",
      code: "AUTH_ERROR",
    });
  }
};

export const authenticateRefreshToken = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        error: "Unauthorized: Refresh token required",
        code: "MISSING_REFRESH_TOKEN",
      });
    }

    return jwt.verify(refreshToken, JWT_SECRET_KEY_REFRESH, (refreshErr, refreshDecoded) => {
      if (refreshErr) {
        if (refreshErr.name === "TokenExpiredError") {
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

      const payload = refreshDecoded as JwtPayload;
      const { userId } = payload;

      if (!userId || typeof userId !== "string") {
        return res.status(403).json({
          error: "Forbidden: Invalid refresh token payload",
          code: "INVALID_REFRESH_PAYLOAD",
        });
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
        userId,
        res,
      );

      res.setHeader("x-access-token", newAccessToken);
      res.setHeader("x-refresh-token", newRefreshToken);

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: "Tokens refreshed successfully",
      });
    });
  } catch (error) {
    console.error("Refresh token error:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({
      error: "Internal server error",
      code: "REFRESH_ERROR",
    });
  }
};
