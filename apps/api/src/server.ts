import app from "./app.js";
import { env } from "@/config/env.js";
import { logger } from "@/infrastructure/logger/logger.js";

const PORT = 4000;

const server = app.listen(PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
    },
    "Server started",
  );
});

export default server;
