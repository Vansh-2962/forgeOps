import { requestContext } from "@/infrastructure/context/request-context.js";
import { NextFunction, Request, Response } from "express";

export const requestContextMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  requestContext.run(
    {
      requestId: req.requestId,
    },
    next,
  );
};
