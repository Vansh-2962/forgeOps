export type AgentEventType =
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

export type AgentEventHandler = (event: AgentEvent) => void | Promise<void>;

export interface AgentEvent {
  id: string;
  agentRunId: string;
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface RunStartEventData {
  repository: string;
  environment: string;
  prompt: string;
}

export interface RunCompletedEventData {
  message: string;
}

export interface RunFailedEventData {
  error: string;
}

export interface ToolStartedEventData {
  tool: string;
  arguements: Record<string, unknown>;
}

export interface ToolCompletedEventData {
  tool: string;
  output: string;
}

export interface ToolFailedEventData {
  tool: string;
  error: string;
}

export interface LLMStartedEventData {
  iteration: number;
}

export interface LLMCompletedEventData {
  iteration: number;
  finishReason: string;
}

export interface LLMFailedEventData {
  iteration: number;
  error: string;
}

export interface AgentMessageEventData {
  message: string;
}
