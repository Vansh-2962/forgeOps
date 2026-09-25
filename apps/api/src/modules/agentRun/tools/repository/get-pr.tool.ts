import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface GetPullRequestArgs {
  pullNumber: number;
}

export class GetPullRequestTool implements AgentTool {
  readonly name = "get_pull_request";

  readonly description =
    "Get detailed information about an existing pull request in the current GitHub repository. " +
    "Use this tool to inspect pull request status, branches, changes, merge state, commits, and other metadata.";

  readonly parameters: Record<string, unknown> = {
    type: "object",

    properties: {
      pullNumber: {
        type: "integer",
        description: "The pull request number, for example 42.",
        minimum: 1,
      },
    },

    required: ["pullNumber"],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { pullNumber } = args as unknown as GetPullRequestArgs;

    if (
      typeof pullNumber !== "number" ||
      !Number.isInteger(pullNumber) ||
      pullNumber < 1
    ) {
      return {
        success: false,
        output: "A valid pull request number is required.",
      };
    }

    const pullRequest = await this.githubService.getPullRequest(
      context.userId,
      context.repository.fullName,
      pullNumber,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,

        pullRequest: {
          number: pullRequest.number,
          title: pullRequest.title,
          body: pullRequest.body,

          state: pullRequest.state,
          draft: pullRequest.draft,
          merged: pullRequest.merged,
          mergeable: pullRequest.mergeable,

          url: pullRequest.htmlUrl,

          head: pullRequest.head,
          base: pullRequest.base,

          author: pullRequest.author,

          createdAt: pullRequest.createdAt,
          updatedAt: pullRequest.updatedAt,
          mergedAt: pullRequest.mergedAt,

          changes: {
            additions: pullRequest.additions,
            deletions: pullRequest.deletions,
            changedFiles: pullRequest.changedFiles,
            commits: pullRequest.commits,
          },
        },
      }),
    };
  }
}
