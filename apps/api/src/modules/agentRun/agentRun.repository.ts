import { prisma } from "@/infrastructure/database/prisma.js";
import { AgentRunDTO } from "./agentRun.dto.js";
import { DbClient } from "../projects/project.types.js";
import { AgentRun, PrismaClient } from "@/generated/prisma/client.js";

export class AgentRunRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createAgentRun(
    data: AgentRunDTO,
    db: DbClient = this.prisma,
  ): Promise<AgentRun> {
    return await db.agentRun.create({
      data: {
        prompt: data.prompt,
        environmentId: data.envId,
        projectId: data.projectId,
        repositoryId: data.repoId,
        userId: data.userId,
      },
    });
  }

  async findAgentsById(userId: string): Promise<AgentRun[]> {
    return await this.prisma.agentRun.findMany({
      where: {
        userId,
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
