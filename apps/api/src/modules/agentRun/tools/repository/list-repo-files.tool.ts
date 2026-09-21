import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "@/modules/agentRun/tools/agent-tool.interface.js";
import { GithubService } from "@/modules/github/github.service.js";

interface ListRepositoryFilesArgs {
  path?: string;
}

export class ListRepositoryTool implements AgentTool {
  readonly name = "list_repository_files";
  readonly description: string =
    "List files and directories inside the GitHub repository." +
    "Use this tool to explore the repository structure before reading file contents.";

  readonly parameters: Record<string, unknown> = {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Directory path inside the repository. Use an empty string or omit this parameter to list the repository root.",
      },
    },
    required: [],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { path } = args as ListRepositoryFilesArgs;
    const files = await this.githubService.listFiles(
      context.userId,
      context.repository.fullName,
      path ?? "",
    );

    return {
      success: true,
      output: JSON.stringify(files),
    };
  }
}
