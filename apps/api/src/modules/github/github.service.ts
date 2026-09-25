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
import {
  CommitFileChange,
  CreateBranchResult,
  CreateCommitResult,
  CreatePullRequestResult,
  CreateRepositoryFileResult,
  DeleteRepoFileResult,
  PullRequestResult,
  RepositoryCodeSearchResult,
  RepositoryDiffResult,
  RepositoryFile,
  RepositoryFileContent,
  RepositoryTreeItem,
  UpdateRepositoryFileResult,
} from "./github.types.js";

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

  async listFiles(
    userId: string,
    repoFullName: string,
    path = "",
  ): Promise<RepositoryFile[]> {
    const connection = await this.githubRepository.getConnection(userId);
    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);
    const url = new URL(
      `${GITHUB_API_URL}/repos/${repoFullName}/content/${path}`,
    );
    const response = await fetch(url, {
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
        "Failed to fetch repository files",
      );
      throw new Error(
        `Github did not return any files for repo : ${repoFullName}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(`Expected a directory but received a file`);
    }

    return data.map((item) => ({
      path: item.path,
      type: item.type === "dir" ? "directory" : "file",
    }));
  }

  async readFile(
    userId: string,
    repoFileName: string,
    path: string,
  ): Promise<RepositoryFileContent> {
    const connection = await this.githubRepository.getConnection(userId);
    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);
    const url = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/contents/${path}`,
    );

    const response = await fetch(url, {
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
        "Failed to read contents",
      );
      throw new Error(`Failed to read file contents`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      throw new Error(`The provided path is a directory, not a file: ${path}`);
    }

    if (data.type !== "file") {
      throw new Error(`The provided path is not a readable file: ${path}`);
    }

    if (!data.content) {
      throw new Error(`GitHub did not return content for file: ${path}`);
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      path: data.path,
      content,
      size: data.size,
      sha: data.sha,
    };
  }

  async searchCode(
    userId: string,
    repoFileName: string,
    query: string,
  ): Promise<RepositoryCodeSearchResult[]> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);

    const searchQuery = `${query} repo:${repoFileName}`;

    const url = new URL(`${GITHUB_API_URL}/search/code`);

    url.searchParams.set("q", searchQuery);

    const response = await fetch(url, {
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
          repository: repoFileName,
          query,
        },
        "Failed to search repository code",
      );

      throw new Error("Failed to search repository code");
    }

    const data = await response.json();

    return data.items.map(
      (item: {
        path: string;
        repository: {
          full_name: string;
        };
        url: string;
        html_url: string;
      }) => ({
        path: item.path,
        repository: item.repository.full_name,
        url: item.url,
        htmlUrl: item.html_url,
      }),
    );
  }

  async getRepoTree(
    userId: string,
    repoFileName: string,
  ): Promise<RepositoryTreeItem[]> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);
    const repoUrl = new URL(`${GITHUB_API_URL}/repos/${repoFileName}`);

    const repoResponse = await fetch(repoUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!repoResponse.ok) {
      const error = await repoResponse.text();

      logger.error(
        {
          status: repoResponse.status,
          error,
          repository: repoFileName,
        },
        "Failed to get repository information",
      );

      throw new Error("Failed to get repository information");
    }

    const repository = await repoResponse.json();

    const defaultBranch = repository.default_branch;

    if (!defaultBranch) {
      throw new Error("Repository does not have a default branch");
    }

    const branchUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/branches/${defaultBranch}`,
    );

    const branchResponse = await fetch(branchUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!branchResponse.ok) {
      const error = await branchResponse.text();

      logger.error(
        {
          status: branchResponse.status,
          error,
          repository: repoFileName,
          branch: defaultBranch,
        },
        "Failed to get repository branch",
      );

      throw new Error("Failed to get repository branch");
    }

    const branch = await branchResponse.json();
    const treeSha = branch.commit?.commit?.tree?.sha;
    if (!treeSha) {
      throw new Error("Unable to resolve repository tree SHA");
    }

    const treeUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/trees/${treeSha}`,
    );

    treeUrl.searchParams.set("recursive", "1");

    const treeResponse = await fetch(treeUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!treeResponse.ok) {
      const error = await treeResponse.text();

      logger.error(
        {
          status: treeResponse.status,
          error,
          repository: repoFileName,
          treeSha,
        },
        "Failed to get repository tree",
      );

      throw new Error("Failed to get repository tree");
    }

    const data = await treeResponse.json();
    return data.tree.map(
      (item: {
        path: string;
        mode: string;
        type: "blob" | "tree" | "commit";
        sha: string;
        size?: number;
        url: string;
      }) => ({
        path: item.path,
        mode: item.mode,
        type: item.type,
        sha: item.sha,
        ...(item.size !== undefined && {
          size: item.size,
        }),
        url: item.url,
      }),
    );
  }

  async createBranch(
    userId: string,
    repoFileName: string,
    branchName: string,
    baseBranch = "main",
  ): Promise<CreateBranchResult> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);
    const branchUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/ref/heads/${baseBranch}`,
    );

    const branchResponse = await fetch(branchUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!branchResponse.ok) {
      const error = await branchResponse.text();

      logger.error(
        {
          status: branchResponse.status,
          error,
          repository: repoFileName,
          baseBranch,
        },
        "Failed to get base branch",
      );

      throw new Error(`Failed to get base branch: ${baseBranch}`);
    }

    const branchData = await branchResponse.json();
    const baseSha = branchData.object?.sha;
    if (!baseSha) {
      throw new Error(`Unable to resolve SHA for base branch: ${baseBranch}`);
    }

    const createRefUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/refs`,
    );

    const createRefResponse = await fetch(createRefUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    });

    if (!createRefResponse.ok) {
      const error = await createRefResponse.text();
      logger.error(
        {
          status: createRefResponse.status,
          error,
          repository: repoFileName,
          branchName,
          baseBranch,
        },
        "Failed to create repository branch",
      );
      throw new Error(`Failed to create branch: ${branchName}`);
    }

    const data = await createRefResponse.json();
    return {
      name: branchName,
      sha: data.object.sha,
      ref: data.ref,
      url: data.url,
    };
  }

  async createFile(
    userId: string,
    repoFileName: string,
    path: string,
    content: string,
    branch: string,
    commitMessage: string,
  ): Promise<CreateRepositoryFileResult> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);
    const url = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/contents/${path}`,
    );

    const encodedContent = Buffer.from(content, "utf-8").toString("base64");
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: encodedContent,
        branch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error(
        {
          status: response.status,
          error,
          repository: repoFileName,
          path,
          branch,
        },
        "Failed to create repository file",
      );
      throw new Error(`Failed to create repository file: ${path}`);
    }

    const data = await response.json();
    return {
      path: data.content.path,
      sha: data.content.sha,
      commitSha: data.commit.sha,
      commitUrl: data.commit.html_url,
      htmlUrl: data.content.html_url,
    };
  }

  async updateFile(
    userId: string,
    repoFileName: string,
    path: string,
    content: string,
    branch: string,
    commitMessage: string,
    sha: string,
  ): Promise<UpdateRepositoryFileResult> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);

    const url = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/contents/${path}`,
    );

    const encodedContent = Buffer.from(content, "utf-8").toString("base64");

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: encodedContent,
        sha,
        branch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      logger.error(
        {
          status: response.status,
          error,
          repository: repoFileName,
          path,
          branch,
        },
        "Failed to update repository file",
      );

      throw new Error(`Failed to update repository file: ${path}`);
    }

    const data = await response.json();

    return {
      path: data.content.path,
      sha: data.content.sha,
      commitSha: data.commit.sha,
      commitUrl: data.commit.html_url,
      htmlUrl: data.content.html_url,
    };
  }

  async deleteFile(
    userId: string,
    repoFileName: string,
    path: string,
    branch: string,
    commitMessage: string,
    sha: string,
  ): Promise<DeleteRepoFileResult> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);

    const url = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/contents/${path}`,
    );

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage,
        sha,
        branch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      logger.error(
        {
          status: response.status,
          error,
          repository: repoFileName,
          path,
          branch,
        },
        "Failed to delete repository file",
      );

      throw new Error(`Failed to delete repository file: ${path}`);
    }

    const data = await response.json();

    return {
      path,
      sha,
      commitSha: data.commit.sha,
      commitUrl: data.commit.html_url,
    };
  }

  async getRepoDiff(
    userId: string,
    repoFileName: string,
    baseBranch: string,
    compareBranch: string,
  ): Promise<RepositoryDiffResult> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);
    const url = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/compare/${baseBranch}...${compareBranch}`,
    );

    const response = await fetch(url, {
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
          repository: repoFileName,
          baseBranch,
          compareBranch,
        },
        "Failed to get repository diff",
      );

      throw new Error("Failed to get repository diff");
    }

    const data = await response.json();
    return {
      status: data.status,
      aheadBy: data.ahead_by,
      behindBy: data.behind_by,
      totalCommits: data.total_commits,

      files: (data.files ?? []).map(
        (file: {
          filename: string;
          status: string;
          additions: number;
          deletions: number;
          changes: number;
          patch?: string;
          blob_url?: string;
          raw_url?: string;
        }) => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          ...(file.patch !== undefined && {
            patch: file.patch,
          }),
          ...(file.blob_url !== undefined && {
            blobUrl: file.blob_url,
          }),
          ...(file.raw_url !== undefined && {
            rawUrl: file.raw_url,
          }),
        }),
      ),
    };
  }

  async createCommit(
    userId: string,
    repoFileName: string,
    branch: string,
    message: string,
    changes: CommitFileChange[],
  ): Promise<CreateCommitResult> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${decryptedAccessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    const branchUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/ref/heads/${branch}`,
    );

    const branchResponse = await fetch(branchUrl, {
      headers,
    });

    if (!branchResponse.ok) {
      const error = await branchResponse.text();

      logger.error(
        {
          status: branchResponse.status,
          error,
          repository: repoFileName,
          branch,
        },
        "Failed to get branch reference",
      );

      throw new Error(`Failed to get branch: ${branch}`);
    }

    const branchData = await branchResponse.json();

    const parentCommitSha = branchData.object?.sha;

    if (!parentCommitSha) {
      throw new Error(`Unable to resolve HEAD commit for branch: ${branch}`);
    }

    const commitUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/commits/${parentCommitSha}`,
    );

    const commitResponse = await fetch(commitUrl, {
      headers,
    });

    if (!commitResponse.ok) {
      const error = await commitResponse.text();

      logger.error(
        {
          status: commitResponse.status,
          error,
          repository: repoFileName,
          commitSha: parentCommitSha,
        },
        "Failed to get parent commit",
      );

      throw new Error("Failed to get parent commit");
    }

    const parentCommit = await commitResponse.json();

    const baseTreeSha = parentCommit.tree?.sha;

    if (!baseTreeSha) {
      throw new Error("Unable to resolve base tree SHA");
    }

    const treeEntries: Array<{
      path: string;
      mode: "100644";
      type: "blob";
      sha: string;
    }> = [];

    for (const change of changes) {
      const blobUrl = new URL(
        `${GITHUB_API_URL}/repos/${repoFileName}/git/blobs`,
      );

      const blobResponse = await fetch(blobUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: change.content,
          encoding: "utf-8",
        }),
      });

      if (!blobResponse.ok) {
        const error = await blobResponse.text();

        logger.error(
          {
            status: blobResponse.status,
            error,
            repository: repoFileName,
            path: change.path,
          },
          "Failed to create Git blob",
        );

        throw new Error(`Failed to create blob for: ${change.path}`);
      }

      const blobData = await blobResponse.json();

      if (!blobData.sha) {
        throw new Error(`GitHub did not return blob SHA for: ${change.path}`);
      }

      treeEntries.push({
        path: change.path,
        mode: "100644",
        type: "blob",
        sha: blobData.sha,
      });
    }

    const treeUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/trees`,
    );

    const treeResponse = await fetch(treeUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeEntries,
      }),
    });

    if (!treeResponse.ok) {
      const error = await treeResponse.text();

      logger.error(
        {
          status: treeResponse.status,
          error,
          repository: repoFileName,
          branch,
        },
        "Failed to create Git tree",
      );

      throw new Error("Failed to create Git tree");
    }

    const treeData = await treeResponse.json();

    const treeSha = treeData.sha;

    if (!treeSha) {
      throw new Error("GitHub did not return tree SHA");
    }

    const createCommitUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/commits`,
    );

    const createCommitResponse = await fetch(createCommitUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentCommitSha],
      }),
    });

    if (!createCommitResponse.ok) {
      const error = await createCommitResponse.text();

      logger.error(
        {
          status: createCommitResponse.status,
          error,
          repository: repoFileName,
          branch,
        },
        "Failed to create Git commit",
      );

      throw new Error("Failed to create Git commit");
    }

    const commitData = await createCommitResponse.json();

    const commitSha = commitData.sha;

    if (!commitSha) {
      throw new Error("GitHub did not return commit SHA");
    }

    const updateRefUrl = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/git/refs/heads/${branch}`,
    );

    const updateRefResponse = await fetch(updateRefUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        sha: commitSha,
      }),
    });

    if (!updateRefResponse.ok) {
      const error = await updateRefResponse.text();

      logger.error(
        {
          status: updateRefResponse.status,
          error,
          repository: repoFileName,
          branch,
          commitSha,
        },
        "Failed to update branch reference",
      );

      throw new Error(`Commit created but failed to update branch: ${branch}`);
    }

    return {
      sha: commitSha,
      message,
      url: commitData.html_url,
      treeSha,
    };
  }

  async createPullRequest(
    userId: string,
    repoFileName: string,
    title: string,
    body: string,
    headBranch: string,
    baseBranch: string,
  ): Promise<CreatePullRequestResult> {
    const connection = await this.githubRepository.getConnection(userId);
    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);

    const url = new URL(`${GITHUB_API_URL}/repos/${repoFileName}/pulls`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${decryptedAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        head: headBranch,
        base: baseBranch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      logger.error(
        {
          status: response.status,
          error,
          repository: repoFileName,
          title,
          headBranch,
          baseBranch,
        },
        "Failed to create pull request",
      );

      throw new Error("Failed to create pull request");
    }

    const data = await response.json();

    return {
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      htmlUrl: data.html_url,
      headBranch: data.head?.ref,
      baseBranch: data.base?.ref,
      headSha: data.head?.sha,
    };
  }

  async getPullRequest(
    userId: string,
    repoFileName: string,
    pullNumber: number,
  ): Promise<PullRequestResult> {
    const connection = await this.githubRepository.getConnection(userId);

    if (!connection) {
      throw new NotFoundError("Github account");
    }

    const decryptedAccessToken = decrypt(connection.accessToken);

    const url = new URL(
      `${GITHUB_API_URL}/repos/${repoFileName}/pulls/${pullNumber}`,
    );

    const response = await fetch(url, {
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
          repository: repoFileName,
          pullNumber,
        },
        "Failed to get pull request",
      );

      throw new Error(`Failed to get pull request: #${pullNumber}`);
    }

    const data = await response.json();

    return {
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      draft: data.draft,
      merged: data.merged,
      mergeable: data.mergeable,

      htmlUrl: data.html_url,

      head: {
        branch: data.head.ref,
        sha: data.head.sha,
      },

      base: {
        branch: data.base.ref,
        sha: data.base.sha,
      },

      author: {
        login: data.user.login,
      },

      createdAt: data.created_at,
      updatedAt: data.updated_at,
      mergedAt: data.merged_at,

      additions: data.additions,
      deletions: data.deletions,
      changedFiles: data.changed_files,

      commits: data.commits,
    };
  }
}
