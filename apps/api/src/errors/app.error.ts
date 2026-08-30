export interface AppErrorOptions {
  statusCode: number;
  code: string;
  isOperational?: boolean;
  details?: unknown;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor({
    statusCode,
    code,
    isOperational = true,
    details,
    message,
  }: AppErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = code;
    this.isOperational = isOperational;
    this.details = details;
    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}
