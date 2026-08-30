import { AppError } from "./app.error.js";

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", details?: unknown) {
    super({
      statusCode: 401,
      code: "AUTHENTICATION_ERROR",
      message,
      details,
    });
    this.name = "AuthenticationError";
  }
}
