export type AgentEventType =
  | "connected"
  | "RUN_STARTED"
  | "RUN_COMPLETED"
  | "RUN_FAILED"
  | "LLM_STARTED"
  | "LLM_COMPLETED"
  | "LLM_FAILED"
  | "TOOL_STARTED"
  | "TOOL_COMPLETED"
  | "TOOL_FAILED"
  | "AGENT_MESSAGE"
  | "AGENT_ERROR";

export interface AgentEvent {
  id: string;
  agentRunId: string;
  type: AgentEventType;
  timestamp: string;
  data: Record<string, unknown>;
}
