export type LLMRole = "system" | "user" | "assistant" | "tool";

export interface LLMSystemMessage {
  role: "system";
  content: string;
}

export interface LLMUserMessage {
  role: "user";
  content: string;
}

export interface LLMAssistantMessage {
  role: "assistant";
  content: string | null;
  toolCalls?: readonly LLMToolCall[];
}

export interface LLMToolMessage {
  role: "tool";
  toolCallId: string;
  content: string;
}

export type LLMMessage =
  | LLMSystemMessage
  | LLMUserMessage
  | LLMAssistantMessage
  | LLMToolMessage;

export interface LLMToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface LLMToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export type LLMFinishReason =
  | "stop"
  | "length"
  | "tool_calls"
  | "content_filter"
  | "error";

export interface LLMCompletionOptions {
  messages: readonly LLMMessage[];
  tools?: readonly LLMToolDefinition[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMCompletionResult {
  content: string | null;
  toolCalls: readonly LLMToolCall[];
  finishReason: LLMFinishReason;
  usage?: LLMUsage;
}
