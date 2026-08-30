export interface CreateGithubConnectionDTO {
  userId: string;
  githubUserId: string;
  githubUserName: string;
  githubEmail?: string | null;
  avatarUrl?: string | null;
  accessToken: string;
}

export interface CreateRepoDTO {
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  userId: string;
  githubRepositoryId: string;
}
