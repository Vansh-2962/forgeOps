import { Redis } from "ioredis";

import { redisConnection } from "@/infrastructure/queue/redis.js";
import { AgentEvent } from "../events.types.js";

export type AgentEventHandler = (event: AgentEvent) => void | Promise<void>;

export class RedisAgentEventSubscriber {
  private readonly subscriber: Redis;

  private readonly handlers = new Map<string, AgentEventHandler>();

  constructor() {
    this.subscriber = redisConnection.duplicate();

    this.subscriber.on("message", this.handleMessage);
  }

  async subscribe(
    agentRunId: string,
    handler: AgentEventHandler,
  ): Promise<void> {
    const channel = this.getChannel(agentRunId);

    this.handlers.set(channel, handler);

    await this.subscriber.subscribe(channel);
  }

  async unsubscribe(agentRunId: string): Promise<void> {
    const channel = this.getChannel(agentRunId);

    this.handlers.delete(channel);

    await this.subscriber.unsubscribe(channel);
  }

  async disconnect(): Promise<void> {
    this.handlers.clear();

    await this.subscriber.quit();
  }

  private handleMessage = async (
    channel: string,
    message: string,
  ): Promise<void> => {
    const handler = this.handlers.get(channel);

    if (!handler) {
      return;
    }

    try {
      const event = JSON.parse(message) as AgentEvent;

      await handler(event);
    } catch (error) {
      console.error(
        {
          channel,
          error,
        },
        "Failed to process agent event",
      );
    }
  };

  private getChannel(agentRunId: string): string {
    return `agent-run:${agentRunId}`;
  }
}
