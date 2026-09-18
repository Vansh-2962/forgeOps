import { env } from "@/config/env";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env?.VITE_BETTER_AUTH_BASE_URL,
});

export const { signIn, signOut, signUp, useSession } = authClient;
