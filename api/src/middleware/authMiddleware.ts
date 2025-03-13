import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { generateTokens } from "../utils/generateSecret";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = process.env;

if (!JWT_SECRET_KEY || !JWT_SECRET_KEY_REFRESH) {
  throw new Error("Missing token in environment variables");
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader?.split(" ")[1];
    if (!accessToken)
      return res.status(401).json({ error: "Unauthorized: Token required" });

    jwt.verify(accessToken, JWT_SECRET_KEY, (error, decoded) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Unauthorized: Token expired" });
        } else {
          return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
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

export const authenticateRefreshToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers["x-refresh-token"] as string;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Refresh token required" });
    }

    jwt.verify(
      refreshToken,
      JWT_SECRET_KEY_REFRESH,
      (refreshErr, refreshDecoded) => {
        if (refreshErr) {
          return res
            .status(403)
            .json({ error: "Forbidden: Invalid refresh token" });
        }
        const userId = (refreshDecoded as JwtPayload).userId;
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          generateTokens(userId);

        res.setHeader("x-access-token", newAccessToken);
        res.setHeader("x-refresh-token", newRefreshToken);

        return res
          .status(200)
          .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
