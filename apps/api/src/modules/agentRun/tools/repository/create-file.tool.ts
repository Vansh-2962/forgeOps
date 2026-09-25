import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface CreateRepositoryFileArgs {
  path: string;
  content: string;
  branch: string;
  commitMessage: string;
}

export class CreateFileTool implements AgentTool {
  readonly name = "create_repository_file";

  readonly description =
    "Create a new file in the current GitHub repository. " +
    "Use this tool when a new source file, configuration file, " +
    "documentation file, or other repository file needs to be created. " +
    "The file will be committed to the specified branch.";

  readonly parameters: Record<string, unknown> = {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "The complete path of the new file inside the repository, for example src/utils/logger.ts.",
      },

      content: {
        type: "string",
        description:
          "The complete UTF-8 content that should be written to the new file.",
      },

      branch: {
        type: "string",
        description: "The branch where the new file should be created.",
      },

      commitMessage: {
        type: "string",
        description: "The commit message for creating the file.",
      },
    },
    required: ["path", "content", "branch", "commitMessage"],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { path, content, branch, commitMessage } =
      args as unknown as CreateRepositoryFileArgs;

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

    const file = await this.githubService.createFile(
      context.userId,
      context.repository.fullName,
      path,
      content,
      branch,
      commitMessage,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,
        path: file.path,
        sha: file.sha,
        branch,
        commitSha: file.commitSha,
        commitUrl: file.commitUrl,
        htmlUrl: file.htmlUrl,
      }),
    };
  }
}
