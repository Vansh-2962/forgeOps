import { AgentEventPublisher } from "../agentEvent.interface.js";
import { AgentEvent } from "../events.types.js";
import { Redis } from "ioredis";

export class RedisEventPublisher implements AgentEventPublisher {
  constructor(private readonly redis: Redis) {}
  async publish(event: AgentEvent): Promise<void> {
    const channel = `agent-run:${event.agentRunId}`;
    await this.redis.publish(channel, JSON.stringify(event));
  }
}
