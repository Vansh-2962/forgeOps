import { AppError } from "./app.error.js";

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      statusCode: 409,
      code: "CONFLICT_ERROR",
      message,
      details,
    });
    this.name = "ConflictError";
  }
}
