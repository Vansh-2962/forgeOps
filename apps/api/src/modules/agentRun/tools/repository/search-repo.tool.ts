import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface SearchRepositoryCodeArgs {
  query: string;
}

export class SearchRepoCodeTool implements AgentTool {
  readonly name = "search_repository_code";

  readonly description = `Search for code, text, functions, classes, variables, imports, or configuration values inside the current GitHub repository. Use this tool to locate relevant files before reading their contents.`;

  readonly parameters: Record<string, unknown> = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The code or text to search for, such as authenticate, AgentExecutorService, PrismaClient, or BetterAuth.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { query } = args as unknown as SearchRepositoryCodeArgs;

    if (!query || typeof query !== "string") {
      return {
        success: false,
        output: "A valid query is required.",
      };
    }

    const result = await this.githubService.searchCode(
      context.userId,
      context.repository.fullName,
      query,
    );

    return {
      success: true,
      output: JSON.stringify({
        query,
        resultCount: result.length,
        result,
      }),
    };
  }
}
