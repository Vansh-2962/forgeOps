import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

export class RepoTreeTool implements AgentTool {
  readonly name = "get_repository_tree";
  readonly description = `
    Get the complete file and directory tree of the current GitHub repository.
    Use this tool when you need to understand the repository structure,
    locate files, inspect project organization, or identify relevant directories.
   `;

  readonly parameters: Record<string, unknown> = {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    _args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    
    const tree = await this.githubService.getRepoTree(
      context.userId,
      context.repository.fullName,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,
        itemCount: tree.length,
        tree,
      }),
    };
  }
}
