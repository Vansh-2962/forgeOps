import { Router } from "express";
import { RedisAgentEventSubscriber } from "./pubsub/agentEvent.subscriber.js";
import { AgentEventController } from "./agentEvent.controller.js";

const router: Router = Router();

const subscriber = new RedisAgentEventSubscriber();
const agentEventController = new AgentEventController(subscriber);

router.get(`/:agentRunId`, agentEventController.streamEvents);

export default router;
