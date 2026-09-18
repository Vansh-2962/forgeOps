import { Request, Response } from "express";
import { ProjectService } from "./project.service.js";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  createProject = async (req: Request, res: Response) => {
    const data = req.body;
    const result = await this.projectService.findOrCreateProject(data);
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: result,
    });
  };

  getAllProjects = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await this.projectService.getAllProjects(userId);
    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: result,
    });
  };
}
