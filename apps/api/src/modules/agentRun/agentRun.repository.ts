import { prisma } from "@/infrastructure/database/prisma.js";
import { AgentRunDTO } from "./agentRun.dto.js";
import { DbClient } from "../projects/project.types.js";
import {
  AgentRun,
  agentStatus,
  PrismaClient,
} from "@/generated/prisma/client.js";
import { AgentRunWithContext } from "./agentRun.types.js";

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

  async findAgentRunById(
    agentRunId: string,
  ): Promise<AgentRunWithContext | null> {
    return await this.prisma.agentRun.findUnique({
      where: {
        id: agentRunId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        repository: {
          select: {
            id: true,
            name: true,
            fullName: true,
            owner: true,
          },
        },
        environment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: agentStatus) {
    return await this.prisma.agentRun.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
