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
import { GroqProvider } from "./llm/providers/groq.provider.js";
import { env } from "@/config/env.js";
import { ToolRegistry } from "./tools/tool-registry.js";

const router: Router = Router();

const agentRunRepository = new AgentRunRepository(prisma);
const agentRunQueue = new AgentRunQueue();
const groqProvider = new GroqProvider(env.GROQ_API_KEY, env.GROQ_MODEL);
const toolRegistry = new ToolRegistry();
const agentExecutorService = new AgentExecutorService(
  groqProvider,
  toolRegistry,
);
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
