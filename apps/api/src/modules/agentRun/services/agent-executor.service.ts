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

export class AgentExecutorService {
  constructor(
    private readonly llmProvider: LLMProvider,
    private readonly toolRegistry: ToolRegistry,
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
      return await tool.execute(args, context);
    } catch (error) {
      return {
        success: false,
        output:
          error instanceof Error ? error.message : "Tool execution failed.",
      };
    }
  }

  async execute(agentRun: AgentRunWithContext): Promise<AgentExecutionResult> {
    const context = this.buildExecutionContext(agentRun);
    const systemPrompt = buildAgentSystemPrompt(context);

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
      const response = await this.llmProvider.generate({
        messages,
        tools,
      });

      if (response.toolCalls.length === 0) {
        return {
          success: true,
          message: response.content ?? "Agent run completed",
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
  }
}
