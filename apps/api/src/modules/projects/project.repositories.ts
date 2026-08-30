import { envType, PrismaClient, Project } from "@/generated/prisma/client.js";
import { CreateProjectDTO } from "./project.dto.js";
import { DbClient } from "./project.types.js";

export class ProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getEnvType(env: string) {
    switch (env) {
      case "production":
        return envType.PRODUCTION;
      case "development":
        return envType.DEVELOPMENT;
      case "staging":
        return envType.STAGING;
      default:
        return envType.DEVELOPMENT;
    }
  }

  async findEnvByProjectName(projectId: string, env: string) {
    return this.prisma.environment.findFirst({
      where: { projectId, name: env },
    });
  }

  async findProjectBySlug(slug: string, db: DbClient = this.prisma) {
    return db.project.findUnique({ where: { slug } });
  }

  async createProject(data: CreateProjectDTO, db: DbClient = this.prisma) {
    return await db.project.create({
      data: {
        name: data.name,
        slug: data.slug ? data.slug : "",
        description: data.description ? data.description : "",
        repositoryId: data.repositoryId,
        ownerId: data.ownerId,
      },
    });
  }

  async findEnvByProjectId(projectId: string) {
    return this.prisma.environment.findFirst({
      where: {
        projectId,
      },
    });
  }

  async createProjectEnvironment(
    projectId: string,
    env: string,
    db: DbClient = this.prisma,
  ) {
    return db.environment.create({
      data: {
        name: env,
        type: this.getEnvType(env),
        projectId,
      },
    });
  }
}
