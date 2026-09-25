import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface CreateBranchArgs {
  branchName: string;
  baseBranch?: string;
}

export class CreateBranchTool implements AgentTool {
  readonly name = "create_branch";
  readonly description = `
      Create a new Git branch in the current GitHub repository. 
      Use this before making repository changes when work should be isolated from the base branch.
  `;

  readonly parameters: Record<string, unknown> = {
    type: "object",
    properties: {
      branchName: {
        type: "string",
        description:
          "The name of the new branch, for example feature/add-auth or fix/login-bug.",
      },
      baseBranch: {
        type: "string",
        description:
          "The existing branch from which the new branch should be created. Defaults to main.",
        default: "main",
      },
    },
    required: ["branchName"],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { branchName, baseBranch } = args as unknown as CreateBranchArgs;
    if (!branchName || typeof branchName !== "string") {
      return {
        success: false,
        output: "A valid branch name is required.",
      };
    }

    const resolvedBaseBranch = baseBranch ?? "main";
    if (typeof resolvedBaseBranch !== "string" || !resolvedBaseBranch) {
      return {
        success: false,
        output: "A valid base branch is required.",
      };
    }

    const branch = await this.githubService.createBranch(
      context.userId,
      context.repository.fullName,
      branchName,
      resolvedBaseBranch,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,
        branch: branch.name,
        baseBranch: resolvedBaseBranch,
        sha: branch.sha,
        ref: branch.ref,
        url: branch.url,
      }),
    };
  }
}
