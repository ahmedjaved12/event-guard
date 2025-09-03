// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppJwtPayload } from "../utils/auth";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: AppJwtPayload;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }

  try {
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // Now safe: decoded is JwtPayload (from lib), but we treat it as AppJwtPayload
    const payload = decoded as unknown as AppJwtPayload;

    req.user = payload;
    next();
  } catch (err: any) {
    console.error("AuthMiddleware error:", err);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

export function requireRole(
  ...roles: ("ADMIN" | "ORGANIZER" | "PARTICIPANT")[]
) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
