import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { sendTokensInCookies } from "../utils/generateSecret";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = process.env;

if (!JWT_SECRET_KEY) {
  throw new Error("Missing JWT_SECRET_KEY in environment variables");
}

if (!JWT_SECRET_KEY_REFRESH) {
  throw new Error("Missing JWT_SECRET_KEY_REFRESH in environment variables");
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized: Token required" });
    }

    jwt.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          const refreshToken = req.cookies.refreshToken;
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
                  .status(401)
                  .json({ error: "Unauthorized: Invalid refresh token" });
              }
              const userId = (refreshDecoded as JwtPayload).userId;
              sendTokensInCookies(userId, res);
              req.user = { id: userId };
              next();
            }
          );
        } else {
          return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
      }
      const payload = decoded as JwtPayload;
      req.user = { id: payload.userId };
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
