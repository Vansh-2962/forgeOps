import { AppError } from "@/errors/app.error.js";
import { getLogger } from "@/infrastructure/logger/context-logger.js";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const logger = getLogger();

  if (error instanceof AppError) {
    logger.warn(
      {
        err: error,
        statusCode: error.statusCode,
        method: req.method,
        url: req.originalUrl,
        errorCode: error.errorCode,
      },
      error.message,
    );

    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        ...(error.details != undefined && error.details),
      },
      requestId: req.requestId,
    });
    return;
  }

  logger.error(
    {
      err: error,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled Application Error",
  );

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occured",
    },
    requestId: req.requestId,
  });
};
