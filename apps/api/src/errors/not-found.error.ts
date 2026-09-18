import { AppError } from "./app.error.js";

export class NotFoundError extends AppError {
  constructor(resource: string, details?: unknown) {
    super({
      statusCode: 404,
      code: "NOT_FOUND",
      message: `${resource} not found`,
      details,
    });
    this.name = "NotFoundError";
  }
}
