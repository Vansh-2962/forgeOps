import { Router } from "express";
import { AgentRunRepository } from "./agentRun.repository.js";
import { prisma } from "@/infrastructure/database/prisma.js";

import { githubService } from "../github/github.routes.js";
import { projectService } from "../projects/project.routes.js";
import { AgentRunQueue } from "@/infrastructure/queue/agent-run.queue.js";
import { AgentController } from "./agentRun.controller.js";
import { asyncHandler } from "@/middlewares/async-handler.middlewares.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { AgentRunService } from "./services/agentRun.service.js";
import { AgentExecutorService } from "./services/agent-executor.service.js";

const router: Router = Router();

const agentRunRepository = new AgentRunRepository(prisma);
const agentRunQueue = new AgentRunQueue();
const agentExecutorService = new AgentExecutorService();
const agentRunService = new AgentRunService(
  agentRunRepository,
  githubService,
  projectService,
  prisma,
  agentRunQueue,
  agentExecutorService,
);
const agentRunController = new AgentController(agentRunService);

router.post(
  "/run",
  authMiddleware,
  asyncHandler(agentRunController.createAgent),
);

router.get(
  "/run",
  authMiddleware,
  asyncHandler(agentRunController.getAllAgentRuns),
);

export default router;
