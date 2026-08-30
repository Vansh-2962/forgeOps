import { getLogger } from "@/infrastructure/logger/context-logger.js";
import { NextFunction, Request, Response } from "express";

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    getLogger().info(
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
      "HTTP request completed",
    );
  });
  next();
};
