import { Prisma, PrismaClient } from "@/generated/prisma/client.js";
import { CreateProjectDTO } from "./project.dto.js";
import { ProjectRepository } from "./project.repositories.js";
import { DbClient } from "./project.types.js";

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async findOrCreateProject(
    data: CreateProjectDTO,
    db: DbClient = this.prisma,
  ) {
    const existingProject = await this.projectRepository.findProjectByRepoId(
      data.repositoryId,
      db,
    );

    if (!existingProject) {
      const response = await this.projectRepository.createProject(data, db);
      return response;
    }

    return existingProject;
  }

  async getProjectEnvironmentByName(
    projectId: string,
    env: string,
    db: DbClient = this.prisma,
  ) {
    const environement = await this.projectRepository.findEnvByProjectName(
      projectId,
      env,
    );
    return environement;
  }

  async createProjectEnvironment(
    projectId: string,
    env: string,
    db: DbClient = this.prisma,
  ) {
    const response = await this.projectRepository.createProjectEnvironment(
      projectId,
      env,
      db,
    );
    return response;
  }

  async getAllProjects(userId: string) {
    return await this.projectRepository.findAllProjects(userId);
  }
}
