import { Prisma, PrismaClient } from "@/generated/prisma/client.js";
import { CreateProjectDTO } from "./project.dto.js";
import { ProjectRepository } from "./project.repositories.js";
import { NotFoundError } from "@/errors/not-found.error.js";
import { DbClient } from "./project.types.js";

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly prisma: PrismaClient,
  ) {}

  private generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  async findOrCreateProject(
    data: CreateProjectDTO,
    db: DbClient = this.prisma,
  ) {
    const slug = this.generateSlug(data.name);
    const existingProject = await this.projectRepository.findProjectBySlug(
      slug,
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
}
