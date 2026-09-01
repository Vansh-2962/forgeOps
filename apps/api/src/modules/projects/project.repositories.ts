import { envType, PrismaClient, Project } from "@/generated/prisma/client.js";
import { CreateProjectDTO } from "./project.dto.js";
import { DbClient } from "./project.types.js";
import { ProjectType } from "@repo/types";

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

  async findProjectByRepoId(repoId: string, db: DbClient = this.prisma) {
    return db.project.findUnique({ where: { repositoryId: repoId } });
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

  async findAllProjects(userId: string): Promise<ProjectType[]> {
    return await this.prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        repository: {
          select: {
            id: true,
            fullName: true,
            defaultBranch: true,
          },
        },
        environments: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
