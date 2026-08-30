import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
});

const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  throw new Error("Invalid environment variables");
  process.exit(1);
}

export const env = envResult.data;
