import { AgentEvent, AgentEventType } from "./events.types.js";

export function createAgentEvent(
  agentRunId: string,
  type: AgentEventType,
  data: Record<string, unknown>,
): AgentEvent {
  return {
    id: crypto.randomUUID(),
    agentRunId,
    type,
    timestamp: new Date().toISOString(),
    data,
  };
}
