import { Router } from "express";
import { ProjectService } from "./project.service.js";
import { ProjectRepository } from "./project.repositories.js";
import { ProjectController } from "./project.controller.js";
import { asyncHandler } from "@/middlewares/async-handler.middlewares.js";
import { prisma } from "@/infrastructure/database/prisma.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router: Router = Router();

const projectRepository = new ProjectRepository(prisma);
export const projectService = new ProjectService(projectRepository, prisma);
const projectController = new ProjectController(projectService);

router.post("/", authMiddleware, asyncHandler(projectController.createProject));
router.get("/", authMiddleware, asyncHandler(projectController.getAllProjects));

export default router;
