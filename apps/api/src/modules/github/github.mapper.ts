import { GithubConnections } from "@/generated/prisma/client.js";

export class GithubMapper {
  static response(data: GithubConnections) {
    return {
      id: data.id || "",
      githubUsername: data.githubUserName || "",
      githubEmail: data.githubEmail || "",
      avatarUrl: data.avatarUrl || "",
    };
  }

  static repoResponse(data: any[]) {
    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      fork: repo.fork,

      owner: {
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
      },

      htmlUrl: repo.html_url,

      defaultBranch: repo.default_branch,

      language: repo.language,

      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,

      size: repo.size,

      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
    }));
  }
}
