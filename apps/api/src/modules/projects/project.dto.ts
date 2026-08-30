export interface CreateProjectDTO {
  name: string;
  slug?: string;
  description?: string;
  repositoryId: string;
  ownerId: string;
}
