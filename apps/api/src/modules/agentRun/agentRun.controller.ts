import { Request, Response } from "express";
import { runSchema } from "./validators/agentRun.schema.js";
import { ValidationError } from "@/errors/validation.error.js";
import { AgentRunService } from "./agentRun.service.js";

export class AgentController {
  constructor(private readonly agentRunService: AgentRunService) {}

  createAgent = async (req: Request, res: Response) => {
    const input = runSchema.safeParse(req.body);
    if (!input.success) {
      throw new ValidationError("Validation failed", input.error.message);
    }

    const userId = req.user.id;
    const response = await this.agentRunService.createAgentRun(
      input.data,
      userId,
    );
    return res.status(201).json({
      success: true,
      message: "Agent created successfully",
      data: response,
    });
  };

  getAllAgentRuns = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const response = await this.agentRunService.getAllAgentRun(userId);
    return res.status(201).json({
      success: true,
      message: "Agent runs fetched successfully",
      data: response,
    });
  };
}
