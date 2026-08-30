import { DbClient } from "../projects/project.types.js";
import { CreateGithubConnectionDTO, CreateRepoDTO } from "./github.dto.js";
import { prisma } from "@/infrastructure/database/prisma.js";

export class GithubRepository {
  constructor() {}

  async createConnection(data: CreateGithubConnectionDTO) {
    return await prisma.githubConnections.upsert({
      where: {
        userId: data.userId,
      },

      create: data,

      update: {
        githubUserId: data.githubUserId ? data.githubUserId : "",
        githubUserName: data.githubUserName ? data.githubUserName : "",
        githubEmail: data.githubEmail ? data.githubEmail : "",
        avatarUrl: data.avatarUrl ? data.avatarUrl : "",
        accessToken: data.accessToken,
      },
    });
  }

  async getConnection(userId: string) {
    return await prisma.githubConnections.findUnique({
      where: { userId },
    });
  }

  async createRepository(data: CreateRepoDTO, db: DbClient = prisma) {
    return await db.repository.create({data});
  }
}
