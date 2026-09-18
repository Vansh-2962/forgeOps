import { AgentRun } from "@/generated/prisma/client.js";

export class AgentRunMapper {
  static response(data: AgentRun, jobId: string) {
    return {
      id: data.id,
      status: data.status,
      createdAt: data.createdAt,
      jobId,
    };
  }
}
