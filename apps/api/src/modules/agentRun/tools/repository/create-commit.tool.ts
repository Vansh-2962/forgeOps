import { GithubService } from "@/modules/github/github.service.js";
import {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface CommitFileChange {
  path: string;
  content: string;
}

interface CreateCommitArgs {
  branch: string;
  message: string;
  changes: CommitFileChange[];
}

export class CreateCommitTool implements AgentTool {
  readonly name = "create_commit";

  readonly description =
    "Create a single Git commit containing multiple file changes in the current GitHub repository. " +
    "Use this when multiple files should be committed together as one logical change. " +
    "Each change must contain the complete file path and complete file content.";

  readonly parameters: Record<string, unknown> = {
    type: "object",

    properties: {
      branch: {
        type: "string",
        description: "The branch where the commit should be created.",
      },

      message: {
        type: "string",
        description:
          "The commit message describing the complete logical change.",
      },

      changes: {
        type: "array",
        description: "The files that should be included in the commit.",
        items: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Complete repository-relative file path.",
            },
            content: {
              type: "string",
              description: "Complete UTF-8 content of the file.",
            },
          },
          required: ["path", "content"],
          additionalProperties: false,
        },
      },
    },

    required: ["branch", "message", "changes"],

    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { branch, message, changes } = args as unknown as CreateCommitArgs;

    if (!branch || typeof branch !== "string") {
      return {
        success: false,
        output: "A valid branch name is required.",
      };
    }

    if (!message || typeof message !== "string") {
      return {
        success: false,
        output: "A valid commit message is required.",
      };
    }

    if (!Array.isArray(changes) || changes.length === 0) {
      return {
        success: false,
        output: "At least one file change is required.",
      };
    }

    for (const change of changes) {
      if (!change || typeof change.path !== "string" || !change.path) {
        return {
          success: false,
          output: "Every file change must contain a valid path.",
        };
      }

      if (typeof change.content !== "string") {
        return {
          success: false,
          output: `Content must be a string for file: ${change.path}`,
        };
      }
    }

    const result = await this.githubService.createCommit(
      context.userId,
      context.repository.fullName,
      branch,
      message,
      changes,
    );

    return {
      success: true,
      output: JSON.stringify({
        repository: context.repository.fullName,
        branch,
        commit: {
          sha: result.sha,
          message: result.message,
          url: result.url,
        },
        treeSha: result.treeSha,
        filesChanged: changes.length,
      }),
    };
  }
}
