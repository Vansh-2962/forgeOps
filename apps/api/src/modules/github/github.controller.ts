import { Request, Response } from "express";
import { GithubService } from "./github.service.js";
import { NotFoundError } from "@/errors/not-found.error.js";
import crypto from "node:crypto";
import { deleteState, getUserId, saveState } from "./github.state.js";
import { logger } from "@/infrastructure/logger/logger.js";
import { env } from "@/config/env.js";

export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  connectGithub = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const state = crypto.randomBytes(32).toString("hex");
    saveState(state, userId);
    const authorizationUrl = this.githubService.getAuthorizationUrl(state);
    return res.redirect(authorizationUrl);
  };

  githubCallback = async (req: Request, res: Response) => {
    const { code, state } = req.query;
    if (!code || typeof code !== "string" || typeof state != "string") {
      return res.redirect(`${env.FRONTEND_URL}/runs?github=error`);
    }

    const userId = getUserId(state);

    if (!userId) {
      return res.redirect(`${env.FRONTEND_URL}/runs?github=error`);
    }

    deleteState(state);

    await this.githubService.handleCallback(code, userId);
    return res.redirect(`${env.FRONTEND_URL}/runs?github=connected`);
  };

  gitHubConnectionStatus = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const connection = await this.githubService.getGithubConnection(userId);
    if (!connection) {
      res.status(200).json({
        success: true,
        message: "Github connection not found",
        data: {
          connected: false,
        },
      });
    }
    return res.status(200).json({
      success: true,
      message: "Github connection found",
      data: {
        githubUserId: connection?.githubUserId,
        githubUserName: connection?.githubUserName,
        connected: true,
      },
    });
  };

  githubRepositories = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const repositories = await this.githubService.getGithubRepositories(userId);
    return res.status(200).json({
      success: true,
      message: "Github repositories found",
      data: repositories,
    });
  };
}
