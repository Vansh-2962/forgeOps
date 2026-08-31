export type AgentStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface AgentRun {
  id: string;
  prompt: string;
  status: AgentStatus;
  projectId: string;
  repositoryId: string;
  environmentId: string;
  userId: string;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  project: {
    name: string;
  };
}

export interface AgentExecutionContext {
  agentRunId: string;
  userId: string;

  project: {
    id: string;
    name: string;
  };

  repository: {
    id: string;
    name: string;
    fullName: string;
    owner: string;
  };

  environment: {
    id: string;
    name: string;
    type: string;
  };

  prompt: string;
}
