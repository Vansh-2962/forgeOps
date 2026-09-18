export interface AgentToolContext {
  agentRunId: string;
  repositoryId: string;
  environmentId: string;
  projectId: string;
  userId: string;
}

export interface AgentToolResult {
  success: boolean;
  output: string;
}

export interface AgentTool {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;

  execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult>;
}
