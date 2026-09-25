import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface DeleteRepoFileArgs {
  path: string;
  branch: string;
  commitMessage: string;
  sha: string;
}

export class DeleteRepoFileTool implements AgentTool {
  readonly name = "delete_repository_file";
  readonly description =
    "Delete an existing file from the current GitHub repository. " +
    "Use this tool only when a file should be permanently removed from the specified branch. " +
    "The current file SHA is required to safely delete the file.";

  readonly parameters: Record<string, unknown> = {
    type: "object",

    properties: {
      path: {
        type: "string",
        description: "The complete path of the file to delete.",
      },

      branch: {
        type: "string",
        description: "The branch from which the file should be deleted.",
      },

      commitMessage: {
        type: "string",
        description: "The commit message describing the file deletion.",
      },

      sha: {
        type: "string",
        description:
          "The current Git blob SHA of the file. Read the file first to obtain its current SHA.",
      },
    },

    required: ["path", "branch", "commitMessage", "sha"],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { path, branch, commitMessage, sha } =
      args as unknown as DeleteRepoFileArgs;

    if (!path || typeof path !== "string") {
      return {
        success: false,
        output: "A valid file path is required.",
      };
    }

    if (!branch || typeof branch !== "string") {
      return {
        success: false,
        output: "A valid branch name is required.",
      };
    }

    if (!commitMessage || typeof commitMessage !== "string") {
      return {
        success: false,
        output: "A valid commit message is required.",
      };
    }

    if (!sha || typeof sha !== "string") {
      return {
        success: false,
        output:
          "A valid file SHA is required. Read the file first to obtain its current SHA.",
      };
    }

    const result = await this.githubService.deleteFile(
      context.userId,
      context.repository.fullName,
      path,
      branch,
      commitMessage,
      sha,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,
        path: result.path,
        branch,
        sha: result.sha,
        commitSha: result.commitSha,
        commitUrl: result.commitUrl,
      }),
    };
  }
}
