import { AgentEvent } from "./events.types.js";

export interface AgentEventPublisher {
  publish(event: AgentEvent): Promise<void>;
}
