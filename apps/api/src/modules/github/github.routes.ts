import express from "express";
import { GithubController } from "./github.controller.js";
import { GithubService } from "./github.service.js";
import { asyncHandler } from "@/middlewares/async-handler.middlewares.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { GithubRepository } from "./github.repository.js";
import { prisma } from "@/infrastructure/database/prisma.js";

const router: express.Router = express.Router();

const githubRepository = new GithubRepository();
export const githubService = new GithubService(githubRepository, prisma);
const githubController = new GithubController(githubService);

router.get(
  "/connect",
  authMiddleware,
  asyncHandler(githubController.connectGithub),
);

router.get("/callback", asyncHandler(githubController.githubCallback));
router.get(
  "/status",
  authMiddleware,
  asyncHandler(githubController.gitHubConnectionStatus),
);
router.get(
  "/repos",
  authMiddleware,
  asyncHandler(githubController.githubRepositories),
);

export default router;
