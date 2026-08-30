import { z } from "zod";
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
  VITE_GOOGLE_CLIENT_ID: z.string().min(1),
  VITE_BETTER_AUTH_BASE_URL: z.string().min(1),
  VITE_FRONTEND_URL: z.string().min(1),
});

const envResult = envSchema.safeParse(
  (import.meta as ImportMeta & { env: Record<string, unknown> }).env,
);

if (!envResult) {
  throw new Error("Invalid environment variables");
}

export const env = envResult.data;
