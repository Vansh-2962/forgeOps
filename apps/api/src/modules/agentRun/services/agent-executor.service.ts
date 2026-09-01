import {
  AgentExecutionResult,
  AgentRunWithContext,
} from "@/modules/agentRun/agentRun.types.js";
import { AgentExecutionContext } from "@repo/types";
import { buildAgentSystemPrompt } from "../agent-syste-prompt.js";

export class AgentExecutorService {
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

  async execute(agentRun: AgentRunWithContext): Promise<AgentExecutionResult> {
    const context = this.buildExecutionContext(agentRun);
    const systemPrompt = buildAgentSystemPrompt(context);
    
    return {
      success: true,
      message: "Agent execution completed",
    };
  }
}
