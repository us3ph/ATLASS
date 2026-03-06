import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  corsOrigin: string;
}

/**
 * Read a secret from Docker secrets (/run/secrets/) or local secrets folder.
 * Falls back to the specified environment variable if no file is found.
 */
const readSecret = (secretName: string, envKey: string, fallback?: string): string => {
  // 1. Docker secrets path (mounted via docker-compose secrets)
  const dockerSecretPath = `/run/secrets/${secretName}`;
  if (fs.existsSync(dockerSecretPath)) {
    return fs.readFileSync(dockerSecretPath, "utf-8").trim();
  }

  // 2. Local secrets folder (for development without Docker)
  const localSecretPath = path.resolve(__dirname, `../../../secrets/${secretName}`);
  if (fs.existsSync(localSecretPath)) {
    return fs.readFileSync(localSecretPath, "utf-8").trim();
  }

  // 3. Fall back to environment variable
  const envValue = process.env[envKey] ?? fallback;
  if (!envValue) {
    throw new Error(
      `Missing secret "${secretName}". Provide it via /run/secrets/${secretName}, secrets/${secretName}, or env var ${envKey}`
    );
  }
  return envValue;
};

const getEnvVariable = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: EnvironmentConfig = {
  port: parseInt(getEnvVariable("BACKEND_PORT", "4000"), 10),
  nodeEnv: getEnvVariable("NODE_ENV", "development"),
  databaseUrl: getEnvVariable("DATABASE_URL"),
  jwtSecret: readSecret("jwt_secret", "JWT_SECRET"),
  aiApiKey: readSecret("openrouter_api_key", "OPENROUTER_API_KEY"),
  aiBaseUrl: getEnvVariable("AI_BASE_URL", "https://openrouter.ai/api/v1"),
  aiModel: getEnvVariable("AI_MODEL", "meta-llama/llama-3.1-8b-instruct:free"),
  corsOrigin: getEnvVariable("CORS_ORIGIN", "http://localhost:5173"),
};
