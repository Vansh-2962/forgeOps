import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface CreatePullRequestArgs {
  title: string;
  body: string;
  headBranch: string;
  baseBranch: string;
}

export class PullRequestTool implements AgentTool {
  readonly name = "create_pull_request";
  readonly description =
    "Create a pull request in the current GitHub repository. " +
    "Use this after repository changes have been completed and reviewed. " +
    "The head branch contains the changes and the base branch is the target branch.";

  readonly parameters: Record<string, unknown> = {
    type: "object",

    properties: {
      title: {
        type: "string",
        description: "A concise title describing the pull request.",
      },

      body: {
        type: "string",
        description:
          "A detailed description of the changes, implementation details, and relevant context.",
      },

      headBranch: {
        type: "string",
        description: "The source branch containing the changes.",
      },

      baseBranch: {
        type: "string",
        description:
          "The target branch into which the changes should be merged.",
      },
    },

    required: ["title", "body", "headBranch", "baseBranch"],

    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { title, body, headBranch, baseBranch } =
      args as unknown as CreatePullRequestArgs;

    if (!title || typeof title !== "string") {
      return {
        success: false,
        output: "A valid pull request title is required.",
      };
    }

    if (typeof body !== "string") {
      return {
        success: false,
        output: "Pull request body must be a string.",
      };
    }

    if (!headBranch || typeof headBranch !== "string") {
      return {
        success: false,
        output: "A valid head branch is required.",
      };
    }

    if (!baseBranch || typeof baseBranch !== "string") {
      return {
        success: false,
        output: "A valid base branch is required.",
      };
    }

    if (headBranch === baseBranch) {
      return {
        success: false,
        output: "Head branch and base branch must be different.",
      };
    }

    const pullRequest = await this.githubService.createPullRequest(
      context.userId,
      context.repository.fullName,
      title,
      body,
      headBranch,
      baseBranch,
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
          url: pullRequest.htmlUrl,
          headBranch: pullRequest.headBranch,
          baseBranch: pullRequest.baseBranch,
          headSha: pullRequest.headSha,
        },
      }),
    };
  }
}
