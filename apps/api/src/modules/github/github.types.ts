export interface RepositoryFile {
  path: string;
  type: "directory" | "file";
}

export interface RepositoryFileContent {
  path: string;
  content: string;
  size: number;
  sha: string;
}

export interface RepositoryCodeSearchResult {
  path: string;
  repository: string;
  url: string;
  htmlUrl: string;
}

export interface RepositoryTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
  url: string;
}

export interface CreateBranchResult {
  name: string;
  sha: string;
  ref: string;
  url: string;
}

export interface CreateRepositoryFileResult {
  path: string;
  sha: string;
  commitSha: string;
  commitUrl: string;
  htmlUrl: string;
}

export interface UpdateRepositoryFileResult {
  path: string;
  sha: string;
  commitSha: string;
  commitUrl: string;
  htmlUrl: string;
}

export interface DeleteRepoFileResult {
  path: string;
  sha: string;
  commitSha: string;
  commitUrl: string;
}

export interface RepositoryDiffFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  blobUrl?: string;
  rawUrl?: string;
}

export interface RepositoryDiffResult {
  status: string;
  aheadBy: number;
  behindBy: number;
  totalCommits: number;
  files: RepositoryDiffFile[];
}

export interface CommitFileChange {
  path: string;
  content: string;
}

export interface CreateCommitResult {
  sha: string;
  message: string;
  url: string;
  treeSha: string;
}

export interface CreatePullRequestResult {
  number: number;
  title: string;
  body: string | null;
  state: string;
  htmlUrl: string;
  headBranch: string;
  baseBranch: string;
  headSha: string;
}

export interface PullRequestResult {
  number: number;
  title: string;
  body: string | null;
  state: string;
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;

  htmlUrl: string;

  head: {
    branch: string;
    sha: string;
  };

  base: {
    branch: string;
    sha: string;
  };

  author: {
    login: string;
  };

  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;

  additions: number;
  deletions: number;
  changedFiles: number;

  commits: number;
}
