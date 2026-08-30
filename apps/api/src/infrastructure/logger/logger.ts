import { env } from "@/config/env.js";
import { pino } from "pino";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "forgeops-api",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "refreshToken",
    ],
    censor: "[REDACTED]",
  },

  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});
