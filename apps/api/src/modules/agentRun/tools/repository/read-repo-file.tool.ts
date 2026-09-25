import { GithubService } from "@/modules/github/github.service.js";
import type {
  AgentTool,
  AgentToolContext,
  AgentToolResult,
} from "../agent-tool.interface.js";

interface ReadRepositoryFileArgs {
  path: string;
}

export class ReadRepositoryFileTool implements AgentTool {
  readonly name = "read_repository_file";

  readonly description =
    "Read the complete contents of a file from the GitHub repository. " +
    "Use this tool when you need to inspect source code, configuration, " +
    "documentation, or any other repository file.";

  readonly parameters: Record<string, unknown> = {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "The exact file path inside the repository, for example src/index.ts or package.json.",
      },
    },
    required: ["path"],
    additionalProperties: false,
  };

  constructor(private readonly githubService: GithubService) {}

  async execute(
    args: Record<string, unknown>,
    context: AgentToolContext,
  ): Promise<AgentToolResult> {
    const { path } = args as unknown as ReadRepositoryFileArgs;

    if (!path || typeof path !== "string") {
      return {
        success: false,
        output: "A valid file path is required.",
      };
    }

    const file = await this.githubService.readFile(
      context.userId,
      context.repository.fullName,
      path,
    );

    return {
      success: true,
      output: JSON.stringify({
        path: file.path,
        size: file.size,
        content: file.content,
        sha: file.sha,
      }),
    };
  }
}
