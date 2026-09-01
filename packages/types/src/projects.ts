export interface ProjectType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner: {
    id: string;
    name: string;
  };
  repository: {
    id: string;
    fullName: string;
    defaultBranch: string;
  };
  environments: {
    id: string;
    name: string;
  }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
