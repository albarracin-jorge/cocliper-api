import { Request, Response, NextFunction } from "express";
import { API_KEY_HASH } from "../config/env.js";

export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const providedKey = req.header("x-api-key");

  if (!providedKey || providedKey !== API_KEY_HASH) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
