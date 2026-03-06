import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  openaiApiKey: string;
  corsOrigin: string;
}

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
  jwtSecret: getEnvVariable("JWT_SECRET"),
  openaiApiKey: getEnvVariable("OPENAI_API_KEY"),
  corsOrigin: getEnvVariable("CORS_ORIGIN", "http://localhost:5173"),
};
