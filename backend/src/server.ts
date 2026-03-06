import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { errorHandler } from "./middleware";
import apiRoutes from "./routes";

const app = express();

// ─── Security Middleware ───
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use(limiter);

// ─── Body Parsing ───
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  });
});

// ─── API Routes ───
app.use("/api", apiRoutes);

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── 404 Handler ───
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Start Server ───
const startServer = async (): Promise<void> => {
  try {
    app.listen(config.port, () => {
      console.log(`
  ╔═══════════════════════════════════════════╗
  ║         🚀 ATLASS API Server              ║
  ║─────────────────────────────────────────── ║
  ║  Port:        ${config.port}                       ║
  ║  Environment: ${config.nodeEnv.padEnd(25)}║
  ║  Health:      http://localhost:${config.port}/api/health ║
  ╚═══════════════════════════════════════════╝
      `);
    });
  } catch (serverError) {
    console.error("Failed to start server:", serverError);
    process.exit(1);
  }
};

startServer();

export default app;
