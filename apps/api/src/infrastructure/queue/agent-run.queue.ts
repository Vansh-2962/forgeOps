import { Queue } from "bullmq";
import {
  AGENT_RUN_JOB,
  AGENT_RUN_QUEUE,
  AgentRunJobData,
} from "./agent-run.types.js";
import { redisConnection } from "./redis.js";

export class AgentRunQueue {
  private readonly queue: Queue<AgentRunJobData>;

  constructor() {
    this.queue = new Queue<AgentRunJobData>(AGENT_RUN_QUEUE, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 2000,
        },

        removeOnComplete: {
          age: 60 * 60 * 24,
          count: 1000,
        },

        removeOnFail: {
          age: 60 * 60 * 24 * 7,
        },
      },
    });
  }

  async addAgentRun(agentRunId: string) {
    return this.queue.add(AGENT_RUN_JOB, { agentRunId }, { jobId: agentRunId });
  }

  async close() {
    await this.queue.close();
  }
}
