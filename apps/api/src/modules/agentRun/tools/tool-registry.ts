import { githubService } from "@/modules/github/github.routes.js";
import { AgentTool } from "./agent-tool.interface.js";
import { CreateBranchTool } from "./repository/create-branch.tool.js";
import { CreateFileTool } from "./repository/create-file.tool.js";
import { ListRepositoryTool } from "./repository/list-repo-files.tool.js";
import { ReadRepositoryFileTool } from "./repository/read-repo-file.tool.js";
import { RepoTreeTool } from "./repository/repo-tree.tool.js";
import { SearchRepoCodeTool } from "./repository/search-repo.tool.js";
import { UpdateRepoFileTool } from "./repository/update-repo.tool.js";
import { DeleteRepoFileTool } from "./repository/delete-repo.tool.js";
import { RepoDiffTool } from "./repository/repo-diff.tool.js";
import { CreateCommitTool } from "./repository/create-commit.tool.js";
import { PullRequestTool } from "./repository/create-pr.tool.js";
import { GetPullRequestTool } from "./repository/get-pr.tool.js";

export class ToolRegistry {
  private readonly tools = new Map<string, AgentTool>();

  register(tool: AgentTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool alread registered ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  getAll(): readonly AgentTool[] {
    return [...this.tools.values()];
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export const toolRegistry = new ToolRegistry();

toolRegistry.register(new ListRepositoryTool(githubService));
toolRegistry.register(new ReadRepositoryFileTool(githubService));
toolRegistry.register(new SearchRepoCodeTool(githubService));
toolRegistry.register(new RepoTreeTool(githubService));
toolRegistry.register(new CreateBranchTool(githubService));
toolRegistry.register(new CreateFileTool(githubService));
toolRegistry.register(new UpdateRepoFileTool(githubService));
toolRegistry.register(new DeleteRepoFileTool(githubService));
toolRegistry.register(new RepoDiffTool(githubService));
toolRegistry.register(new CreateCommitTool(githubService));
toolRegistry.register(new PullRequestTool(githubService));
toolRegistry.register(new GetPullRequestTool(githubService));
