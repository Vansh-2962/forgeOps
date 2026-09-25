import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface GetReposDiffArgs {
  baseBranch: string;
  compareBranch: string;
}

export class RepoDiffTool implements AgentTool {
  readonly name = "get_repository_diff";

  readonly description =
    "Compare two branches in the current GitHub repository and return the changes between them. " +
    "Use this tool to inspect modified, added, or deleted files before creating a commit or pull request.";

  readonly parameters: Record<string, unknown> = {
    type: "object",

    properties: {
      baseBranch: {
        type: "string",
        description: "The base branch to compare against, for example main.",
      },

      compareBranch: {
        type: "string",
        description:
          "The branch containing the changes, for example feature/auth-fix.",
      },
    },

    required: ["baseBranch", "compareBranch"],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { baseBranch, compareBranch } = args as unknown as GetReposDiffArgs;

    if (!baseBranch || typeof baseBranch !== "string") {
      return {
        success: false,
        output: "A valid base branch is required.",
      };
    }

    if (!compareBranch || typeof compareBranch !== "string") {
      return {
        success: false,
        output: "A valid compare branch is required.",
      };
    }

    if (baseBranch === compareBranch) {
      return {
        success: false,
        output: "Base branch and compare branch must be different",
      };
    }

    const diff = await this.githubService.getRepoDiff(
      context.userId,
      context.repository.fullName,
      baseBranch,
      compareBranch,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,
        baseBranch,
        compareBranch,

        status: diff.status,
        aheadBy: diff.aheadBy,
        behindBy: diff.behindBy,
        totalCommits: diff.totalCommits,

        files: diff.files,
      }),
    };
  }
}
