export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;

  owner: GithubRepositoryOwner;

  html_url: string;
  default_branch: string;

  language: string | null;

  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;

  size: number;

  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

export interface GithubRepositoryOwner {
  login: string;
  id: number;
  avatar_url: string;
}
