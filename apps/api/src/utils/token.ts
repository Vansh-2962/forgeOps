import { env } from "@/config/env.js";
import { CreateTokenDTO } from "@/modules/auth/auth.dto.js";
import jwt from "jsonwebtoken";

export function generateToken(payload: CreateTokenDTO) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
}
