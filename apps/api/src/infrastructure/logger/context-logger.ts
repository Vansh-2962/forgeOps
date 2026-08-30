import { Logger } from "pino";
import { requestContext } from "@/infrastructure/context/request-context.js";
import { logger } from "./logger.js";

export const getLogger = (): Logger => {
  const context = requestContext.getStore();

  if (!context) {
    return logger;
  }

  return logger.child({
    requestId: context.requestId,
  });
};
