export interface RepositoryFile {
  path: string;
  type: "directory" | "file";
}

export interface RepositoryFileContent {
  path: string;
  content: string;
  size: number;
}
