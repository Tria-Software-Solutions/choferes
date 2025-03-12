import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendTokensInCookies } from "../utils/generateSecret";

const { JWT_SECRET_KEY_REFRESH } = process.env;

export const refreshToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  jwt.verify(refreshToken, JWT_SECRET_KEY_REFRESH, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const userId = (decoded as jwt.JwtPayload).userId;

    sendTokensInCookies(userId, res);

    return res.status(200).json({ message: "Token refreshed successfully" });
  });
};
