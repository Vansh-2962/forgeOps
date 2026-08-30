import { NotFoundError } from "@/errors/not-found.error.js";
import { PrismaClient } from "@/generated/prisma/client.js";
import { getLogger } from "@/infrastructure/logger/context-logger.js";
import { AgentRunQueue } from "@/infrastructure/queue/agent-run.queue.js";
import { AgentRunJobData } from "@/infrastructure/queue/agent-run.types.js";
import { AgentRunRepository } from "@/modules/agentRun/agentRun.repository.js";
import { RunSchema } from "@/modules/agentRun/validators/agentRun.schema.js";
import { GithubService } from "@/modules/github/github.service.js";
import { ProjectService } from "@/modules/projects/project.service.js";
import { AgentRunMapper } from "./agentRun.mapper.js";

export class AgentRunService {
  constructor(
    private readonly agentRunRepository: AgentRunRepository,
    private readonly githubService: GithubService,
    private readonly projectService: ProjectService,
    private readonly prisma: PrismaClient,
    private readonly agentRunQueue: AgentRunQueue,
  ) {}

  async createAgentRun(input: RunSchema, userId: string) {
    const logger = getLogger();
    const repository = await this.githubService.getRepositoryById(
      userId,
      input.repoId,
    );

    if (!repository) {
      throw new NotFoundError("Repository");
    }

    const agentRun = await this.prisma.$transaction(async (tx) => {
      const repo = await this.githubService.createRepository(
        {
          name: repository.full_name.split("/").pop()!,
          fullName: repository.full_name,
          owner: repository.owner.login,
          defaultBranch: repository.default_branch,
          isPrivate: repository.private,
          userId,
          githubRepositoryId: String(repository.id),
        },
        tx,
      );

      const project = await this.projectService.findOrCreateProject(
        {
          name: repo.fullName.split("/").pop()!,
          slug: repo.fullName,
          repositoryId: repo.id,
          ownerId: repo.userId,
        },
        tx,
      );

      let environment = await this.projectService.getProjectEnvironmentByName(
        project.id,
        input.envId as string,
        tx,
      );

      if (!environment) {
        environment = await this.projectService.createProjectEnvironment(
          project!.id,
          input.envId as string,
          tx,
        );
      }

      const agentRun = await this.agentRunRepository.createAgentRun(
        {
          prompt: input.prompt.trim(),
          projectId: project.id,
          envId: environment.id,
          repoId: repo.id,
          userId,
        },
        tx,
      );

      return agentRun;
    });

    const job = await this.agentRunQueue.addAgentRun(agentRun.id);

    return AgentRunMapper.response(agentRun, job.id as string);
  }

  async getAllAgentRun(userId: string) {
    const response = await this.agentRunRepository.findAgentsById(userId);
    return response;
  }
}
