import { Prisma } from "@/generated/prisma/client.js";

export const agentRunWithContextArgs = {
  include: {
    project: {
      select: {
        id: true,
        name: true,
      },
    },

    repository: {
      select: {
        id: true,
        name: true,
        fullName: true,
        owner: true,
      },
    },

    environment: {
      select: {
        id: true,
        name: true,
        type: true,
      },
    },
  },
} satisfies Prisma.AgentRunDefaultArgs;

export type AgentRunWithContext = Prisma.AgentRunGetPayload<
  typeof agentRunWithContextArgs
>;


export interface AgentExecutionResult {
  success:boolean
  message:string
}