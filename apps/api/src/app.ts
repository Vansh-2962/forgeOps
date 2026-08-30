import express, { Application, Request, Response } from "express";
import { requestIdMiddleware } from "@/middlewares/request-id.middleware.js";
import { requestContextMiddleware } from "@/middlewares/rqeuest-context.middleware.js";
import { requestLoggerMiddleware } from "@/middlewares/request-logger.middleware.js";
import { errorMiddleware } from "@/middlewares/error.middleware.js";
import GithubRouter from "@/modules/github/github.routes.js";
import AgentRouter from "@/modules/agentRun/agentRun.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth.js";

const app: Application = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

app.use(requestIdMiddleware);
app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "Ok",
  });
});

app.use("/api/v1/github", GithubRouter);
app.use("/api/v1/agent", AgentRouter);

app.use(errorMiddleware);

export default app;
