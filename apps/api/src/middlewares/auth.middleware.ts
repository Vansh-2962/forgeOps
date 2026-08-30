import { AuthenticationError } from "@/errors/authentication.error.js";
import { auth } from "@/lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AuthenticationError("Authentication required");
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
      return;
    }

    next(new AuthenticationError("Invalid or expired session"));
  }
};
