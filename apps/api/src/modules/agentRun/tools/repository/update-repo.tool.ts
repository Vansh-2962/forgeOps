import { GithubService } from "@/modules/github/github.service.js";
import type {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface UpdateRepositoryFileArgs {
  path: string;
  content: string;
  branch: string;
  commitMessage: string;
  sha: string;
}

export class UpdateRepoFileTool implements AgentTool {
  readonly name = "update_repository_file";

  readonly description =
    "Update an existing file in the current GitHub repository. " +
    "Use this tool when modifying source code, configuration, documentation, " +
    "or any other existing repository file. " +
    "The current file SHA is required to safely update the file.";

  readonly parameters: Record<string, unknown> = {
    type: "object",

    properties: {
      path: {
        type: "string",
        description:
          "The complete path of the existing file inside the repository.",
      },

      content: {
        type: "string",
        description: "The complete new UTF-8 content of the file.",
      },

      branch: {
        type: "string",
        description: "The branch where the file should be updated.",
      },

      commitMessage: {
        type: "string",
        description: "The commit message describing the file update.",
      },

      sha: {
        type: "string",
        description:
          "The current Git blob SHA of the file. Obtain this by reading the file before updating it.",
      },
    },

    required: ["path", "content", "branch", "commitMessage", "sha"],

    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { path, content, branch, commitMessage, sha } =
      args as unknown as UpdateRepositoryFileArgs;

    if (!path || typeof path !== "string") {
      return {
        success: false,
        output: "A valid file path is required.",
      };
    }

    if (typeof content !== "string") {
      return {
        success: false,
        output: "File content must be a string.",
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

    const file = await this.githubService.updateFile(
      context.userId,
      context.repository.fullName,
      path,
      content,
      branch,
      commitMessage,
      sha,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,
        path: file.path,
        branch,
        sha: file.sha,
        commitSha: file.commitSha,
        commitUrl: file.commitUrl,
        htmlUrl: file.htmlUrl,
      }),
    };
  }
}
