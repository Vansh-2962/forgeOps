import { logger } from "@/infrastructure/logger/logger.js";
import {
  AGENT_RUN_QUEUE,
  AgentRunJobData,
} from "@/infrastructure/queue/agent-run.types.js";
import { redisConnection } from "@/infrastructure/queue/redis.js";
import { agentRunService } from "@/modules/agentRun/agentRun.routes.js";
import { type Job, Worker } from "bullmq";

async function processAgentRun(job: Job<AgentRunJobData>) {
  const { agentRunId } = job.data;

  logger.info({ agentRunId, jobId: job.id }, "Agent run executing...");

  await agentRunService.executeAgentRun(agentRunId);

  await job.updateProgress(100);

  logger.info({ agentRunId, jobId: job.id }, "Agent run completed...");
  return { agentRunId };
}

export const agentRunWorker = new Worker<AgentRunJobData>(
  AGENT_RUN_QUEUE,
  processAgentRun,
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

agentRunWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Agent Run Completed");
});

agentRunWorker.on("failed", (job, error) => {
  logger.warn({ jobId: job?.id, error: error }, "Agent Run Failed");
});

agentRunWorker.on("error", (error) => {
  logger.warn({ error: error }, "Agent Run Error");
});
