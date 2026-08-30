import { z } from "zod";

export const runSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
  repoId: z.string().trim().min(1, "Repo is required"),
  envId: z.string().trim().optional(),
});

export type RunSchema = z.infer<typeof runSchema>;
