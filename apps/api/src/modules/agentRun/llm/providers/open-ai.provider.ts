import OpenAI from "openai";

import type { LLMProvider } from "../llm-provider.interface.js";
import {
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMFinishReason,
  LLMMessage,
  LLMToolCall,
  LLMToolDefinition,
} from "../llm.types.js";

type OpenAIFunctionToolCall =
  OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall;

export class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  async generate(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,

      messages: options.messages.map((message: LLMMessage) =>
        this.mapMessage(message),
      ),

      ...(options.tools
        ? {
            tools: options.tools.map((tool: LLMToolDefinition) =>
              this.mapToolDefinition(tool),
            ),
          }
        : {}),

      ...(options.temperature !== undefined
        ? {
            temperature: options.temperature,
          }
        : {}),

      ...(options.maxTokens !== undefined
        ? {
            max_tokens: options.maxTokens,
          }
        : {}),
    });

    const choice = response.choices[0];

    if (!choice) {
      throw new Error("OpenAI returned no completion choices");
    }

    const message = choice.message;

    const result: LLMCompletionResult = {
      content: message.content,
      toolCalls: this.mapToolCalls(message.tool_calls),
      finishReason: this.mapFinishReason(choice.finish_reason),
    };

    if (response.usage) {
      result.usage = {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      };
    }

    return result;
  }

  private mapToolDefinition(
    tool: LLMToolDefinition,
  ): OpenAI.Chat.Completions.ChatCompletionTool {
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    };
  }

  private mapMessage(
    message: LLMMessage,
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam {
    switch (message.role) {
      case "system":
        return {
          role: "system",
          content: message.content,
        };

      case "user":
        return {
          role: "user",
          content: message.content,
        };

      case "assistant":
        return {
          role: "assistant",
          content: message.content,
          ...(message.toolCalls
            ? {
                tool_calls: this.mapAssistantToolCalls(message.toolCalls),
              }
            : {}),
        };

      case "tool":
        return {
          role: "tool",
          tool_call_id: message.toolCallId,
          content: message.content,
        };
    }
  }

  private mapAssistantToolCalls(
    toolCalls: readonly LLMToolCall[],
  ): OpenAIFunctionToolCall[] {
    return toolCalls.map((toolCall) => ({
      id: toolCall.id,
      type: "function",
      function: {
        name: toolCall.name,
        arguments: toolCall.arguments,
      },
    }));
  }

  private mapToolCalls(
    toolCalls:
      | readonly OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
      | undefined,
  ): LLMToolCall[] {
    if (!toolCalls) {
      return [];
    }

    return toolCalls.filter(this.isFunctionToolCall).map((toolCall) => ({
      id: toolCall.id,
      name: toolCall.function.name,
      arguments: toolCall.function.arguments,
    }));
  }

  private isFunctionToolCall(
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): toolCall is OpenAIFunctionToolCall {
    return toolCall.type === "function";
  }

  private mapFinishReason(finishReason: string | null): LLMFinishReason {
    switch (finishReason) {
      case "stop":
        return "stop";

      case "length":
        return "length";

      case "tool_calls":
        return "tool_calls";

      case "content_filter":
        return "content_filter";

      default:
        return "error";
    }
  }
}
