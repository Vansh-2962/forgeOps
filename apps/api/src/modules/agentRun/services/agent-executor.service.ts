import {
  AgentExecutionResult,
  AgentRunWithContext,
} from "@/modules/agentRun/agentRun.types.js";
import { AgentExecutionContext } from "@repo/types";
import { buildAgentSystemPrompt } from "../agent-syste-prompt.js";
import {
  LLMCompletionResult,
  LLMMessage,
  LLMToolCall,
  LLMToolDefinition,
} from "@/modules/agentRun/llm/llm.types.js";
import { LLMProvider } from "@/modules/agentRun/llm/llm-provider.interface.js";
import { ToolRegistry } from "@/modules/agentRun/tools/tool-registry.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../tools/agent-tool.interface.js";
import { AgentEventPublisher } from "../agentEventPublisher/agentEvent.interface.js";
import { createAgentEvent } from "../agentEventPublisher/agentEvent.factory.js";

export class AgentExecutorService {
  constructor(
    private readonly llmProvider: LLMProvider,
    private readonly toolRegistry: ToolRegistry,
    private readonly eventPublisher: AgentEventPublisher,
  ) {}

  private readonly MAX_ITERATIONS = 20;

  private buildExecutionContext(
    agentRun: AgentRunWithContext,
  ): AgentExecutionContext {
    return {
      agentRunId: agentRun.id,

      project: {
        id: agentRun.project.id,
        name: agentRun.project.name,
      },

      repository: {
        id: agentRun.repository.id,
        name: agentRun.repository.name,
        fullName: agentRun.repository.fullName,
        owner: agentRun.repository.owner,
      },

      environment: {
        id: agentRun.environment!.id,
        name: agentRun.environment!.name,
        type: agentRun.environment!.type,
      },
      userId: agentRun.userId,
      prompt: agentRun.prompt,
    };
  }

  private buildToolContext(context: AgentExecutionContext): AgentToolContext {
    return {
      agentRunId: context.agentRunId,
      userId: context.userId,
      projectId: context.project.id,
      repository: {
        id: context.repository.id,
        fullName: context.repository.fullName,
        owner: context.repository.owner,
      },
      environmentId: context.environment.id,
    };
  }

  private buildLLMTools(): LLMToolDefinition[] {
    return this.toolRegistry.getAll().map(
      (tool: AgentTool): LLMToolDefinition => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      }),
    );
  }

  private async executeToolCall(
    toolCall: LLMToolCall,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const tool = this.toolRegistry.get(toolCall.name);

    if (!tool) {
      return {
        success: false,
        output: `Tool not found: ${toolCall.name}`,
      };
    }

    let args: Record<string, unknown>;

    try {
      args = JSON.parse(toolCall.arguments);
    } catch (error) {
      return {
        success: false,
        output: `Invalid JSON arguements for tool: ${toolCall.name}`,
      };
    }

    try {
      await this.eventPublisher.publish(
        createAgentEvent(context.agentRunId, "TOOL_START", {
          tool: toolCall.name,
          arguments: args,
        }),
      );
      const result = await tool.execute(args, context);
      if (result.success) {
        await this.eventPublisher.publish(
          createAgentEvent(context.agentRunId, "TOOL_COMPLETED", {
            tool: toolCall.name,
            output: result.output,
          }),
        );
      } else {
        await this.eventPublisher.publish(
          createAgentEvent(context.agentRunId, "TOOL_FAILED", {
            tool: toolCall.name,
            error: result.output,
          }),
        );
      }
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tool execution failed.";

      await this.eventPublisher.publish(
        createAgentEvent(context.agentRunId, "TOOL_FAILED", {
          tool: toolCall.name,
          error: message,
        }),
      );

      return {
        success: false,
        output: message,
      };
    }
  }

  async execute(
    agentRun: AgentRunWithContext,
  ): Promise<AgentExecutionResult | undefined> {
    const context = this.buildExecutionContext(agentRun);
    const systemPrompt = buildAgentSystemPrompt(context);

    try {
      await this.eventPublisher.publish(
        createAgentEvent(context.agentRunId, "RUN_STARTED", {
          repository: context.repository.fullName,
          environment: context.environment!.name,
          prompt: context.prompt,
        }),
      );

      const messages: LLMMessage[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: context.prompt,
        },
      ];

      const tools = this.buildLLMTools();
      const toolContext = this.buildToolContext(context);

      for (let iteration = 0; iteration < this.MAX_ITERATIONS; iteration++) {
        await this.eventPublisher.publish(
          createAgentEvent(context.agentRunId, "LLM_STARTED", {
            iteration,
          }),
        );

        let response: LLMCompletionResult;
        try {
          response = await this.llmProvider.generate({
            messages,
            tools,
          });
        } catch (error) {
          await this.eventPublisher.publish(
            createAgentEvent(context.agentRunId, "LLM_FAILED", {
              iteration,
              error:
                error instanceof Error ? error.message : "LLM request failed",
            }),
          );

          throw error;
        }

        if (response.toolCalls.length === 0) {
          const message =
            response.content ?? "Agent completed without a response.";

          await this.eventPublisher.publish(
            createAgentEvent(context.agentRunId, "AGENT_MESSAGE", {
              message,
            }),
          );

          await this.eventPublisher.publish(
            createAgentEvent(context.agentRunId, "RUN_COMPLETED", {
              message,
            }),
          );

          return {
            success: true,
            message,
          };
        }

        messages.push({
          role: "assistant",
          content: response.content,
          toolCalls: response.toolCalls,
        });

        for (const toolCall of response.toolCalls) {
          const toolResult = await this.executeToolCall(toolCall, toolContext);

          messages.push({
            role: "tool",
            toolCallId: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }
      }

      throw new Error(
        `Agent executed maximum iteration count (${this.MAX_ITERATIONS})`,
      );
    } catch (error) {
      await this.eventPublisher.publish(
        createAgentEvent(context.agentRunId, "RUN_FAILED", {
          error:
            error instanceof Error ? error.message : "Agent execution failed.",
        }),
      );
      throw error;
    }
  }
}
