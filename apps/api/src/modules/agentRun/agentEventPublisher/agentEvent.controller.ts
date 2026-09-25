import { Request, Response } from "express";
import { RedisAgentEventSubscriber } from "./pubsub/agentEvent.subscriber.js";
import { AgentEvent } from "./events.types.js";

export class AgentEventController {
  constructor(private readonly eventSubscriber: RedisAgentEventSubscriber) {}

  streamEvents = async (req: Request, res: Response): Promise<void> => {
    const { agentRunId } = req.params;

    if (!agentRunId) {
      res.status(400).json({
        success: false,
        message: "Agent run ID is required",
      });

      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    res.write(`event: connected\n\n`);
    res.write(`data: ${JSON.stringify({ agentRunId })}\n\n`);

    const handleEvent = async (event: AgentEvent) => {
      res.write(`id: ${event.id}\n`);
      res.write(`event: ${event.type}\n\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    };

    try {
      await this.eventSubscriber.subscribe(agentRunId as string, handleEvent);
    } catch (error) {
      res.write(`event: error\n\n`);
      res.write(
        `data: ${JSON.stringify({
          message:
            error instanceof Error
              ? error.message
              : "Failed to subscribe to agent events",
        })}\n\n`,
      );

      res.end();
      return;
    }

    const heartbeat = setInterval(() => {
      res.write(`event: heartbeat\n\n\n`);
    }, 15 * 1000);

    req.on("close", async () => {
      clearInterval(heartbeat);

      await this.eventSubscriber.unsubscribe(agentRunId as string);

      if (!res.writableEnded) {
        res.end();
      }
    });
  };
}
