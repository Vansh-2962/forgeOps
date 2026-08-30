import { AppError } from "./app.error.js";

export class ValidationError extends AppError {
  constructor(message = "Request Validation failed", details?: unknown) {
    super({
      statusCode: 409,
      code: "VALIDATION_ERROR",
      message,
      details,
    });
    this.name = "ValidationError";
  }
}
