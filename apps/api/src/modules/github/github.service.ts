import { env } from "@/config/env.js";
import {
  GITHUB_ACCESS_TOKEN_URL,
  GITHUB_API_URL,
  GITHUB_AUTHORIZE_URL,
} from "./github.constants.js";
import { GithubRepository } from "./github.repository.js";
import { decrypt, encrypt } from "@/utils/encryption.js";
import { GithubMapper } from "./github.mapper.js";
import { logger } from "@/infrastructure/logger/logger.js";
import { NotFoundError } from "@/errors/not-found.error.js";
import { DbClient } from "../projects/project.types.js";
import { PrismaClient, Repository } from "@/generated/prisma/client.js";
import { CreateRepoDTO } from "./github.dto.js";

export class GithubService {
  constructor(
    private readonly githubRepository: GithubRepository,
    private readonly prisma: PrismaClient,
  ) {}

  getAuthorizationUrl(state: string) {
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: env.GITHUB_CALLBACK_URL,
      scope: "read:user user:email",
      state,
    });

    return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
  }

  async handleCallback(code: string, userId: string) {
    const response = await fetch(GITHUB_ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.GITHUB_CALLBACK_URL,
      }),
    });

    if (!response.ok) {
      throw new Error("Github token exchange failed");
    }

    const data = await response.json();
    const accessToken = data.access_token;

    if (!accessToken) {
      throw new Error("Github did not return an access token");
    }

    const githubUser = await this.getGithubUser(accessToken);

    const connection = await this.githubRepository.createConnection({
      userId,
      githubUserId: String(githubUser.id),
      githubUserName: githubUser.login,
      githubEmail: githubUser.email,
      avatarUrl: githubUser.avatar_url,
      accessToken: encrypt(accessToken),
    });

    return GithubMapper.response(connection);
  }

  async getGithubUser(accessToken: string) {
    const res = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!res.ok) {
      throw new Error("Github did not return an user");
    }

    return res.json();
  }

  async getGithubConnection(userId: string) {
    const connection = await this.githubRepository.getConnection(userId);
    return connection;
  }

  async getGithubRepositories(userId: string) {
    const connection = await this.githubRepository.getConnection(userId);
    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);

    const response = await fetch(
      `${GITHUB_API_URL}/user/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${decryptedAccessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();

      logger.error(
        {
          status: response.status,
          error,
        },
        "Failed to fetch GitHub repositories",
      );
      throw new Error("Github did not return any repositories");
    }

    const repositories = await response.json();
    return GithubMapper.repoResponse(repositories);
  }

  async getRepositoryById(userId: string, repoId: string) {
    const connection = await this.githubRepository.getConnection(userId);
    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);
    const response = await fetch(`${GITHUB_API_URL}/repositories/${repoId}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      const error = await response.text();

      logger.error(
        {
          status: response.status,
          error,
        },
        "Failed to fetch GitHub repository",
      );
      throw new Error("Github did not return any repositories");
    }

    const repository = await response.json();
    return repository;
  }

  async createRepository(
    data: CreateRepoDTO,
    db: DbClient = this.prisma,
  ): Promise<Repository> {
    return await this.githubRepository.createRepository(data, db);
  }
}
