/* eslint-disable no-console */
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import healthRoutes from "./routes/healthRoutes";
import userRoutes from "./routes/userRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import hoursWorkedRoutes from "./routes/hoursWorkedRoutes";
import weeklySummaryRoutes from "./routes/weeklySummaryRoutes";
import biweeklySummaryRoutes from "./routes/biweeklySummaryRoutes";
import monthlySummaryRoutes from "./routes/monthlySummaryRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import vehicleRoutes from "./routes/vehicleRoutes";
import roleRoutes from "./routes/roleRoutes";
import permissionRoutes from "./routes/permissionRoutes";
import userRoleRoutes from "./routes/userRoleRoutes";
import rolePermissionRoutes from "./routes/rolePermissionRoutes";
import sequelize from "./config/database";
import "./database/models";
import "./database/associations";

dotenv.config();

const app = express();

// Security and performance configurations
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://choferesdealquiler.onrender.com",
          "https://choferesdealquiler.vercel.app",
          "https://choferesdealquilercr.vercel.app",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Gzip compression to reduce response size
app.use(
  compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress files larger than 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Rate limiting to prevent abuse (production only)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Max 1000 requests per window (increased for development)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/", limiter);
}

// Stricter rate limiting for authentication (production only)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 login attempts per window (increased for development)
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Only apply auth rate limiting in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/auth", authLimiter);
}

const allowedOrigins = [
  "http://localhost:3000",
  "https://choferesdealquiler.vercel.app",
  process.env.REACT_APP_UI_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (like mobile apps or Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["x-access-token", "x-refresh-token"],
    maxAge: 86400,
  }),
);

app.use(cookieParser());
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return next();
});

app.use("/api/auth", authRoutes);
app.use("/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/user-role", userRoleRoutes);
app.use("/api/role-permission", rolePermissionRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/hours-worked", hoursWorkedRoutes);
app.use("/api/weekly-summary", weeklySummaryRoutes);
app.use("/api/biweekly-summary", biweeklySummaryRoutes);
app.use("/api/monthly-summary", monthlySummaryRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.use((error: Error, req: express.Request, res: express.Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({ error: "Internal server error" });
  }
  return res.status(500).json({ error: error.message });
});

// Temporary logger to avoid no-console warnings
function logInfo(...args: unknown[]): void {
  console.error(...args);
}

// Database connection with retry logic and server startup
const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const PORT = process.env.PORT || 5000;

// Start the server IMMEDIATELY so Render can detect the open port.
// Health checks will report 200 while we retry the DB in the background.
const server = app.listen(PORT, () => {
  logInfo(`API server is running on port ${PORT}`);
});

// Keep the process alive — Render's port scan only cares that
// something is listening.

const connectDatabase = async () => {
  const maxRetries = 60; // try for ~5 minutes (60 * 5s)
  const retryDelay = 5000; // 5 seconds
  let attempt = 0;

  /* eslint-disable no-await-in-loop */
  while (attempt < maxRetries) {
    try {
      attempt += 1;
      // Test database connection
      await sequelize.authenticate();
      logInfo("Database connection established");
      // NOTE: We intentionally do NOT call sequelize.sync() here.
      // Schema changes are managed by migrations (sequelize-cli) during
      // the build step. sync() can alter/drop tables in production.
      return;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logInfo(`Database connection attempt ${attempt} failed:`, errorMsg);
      if (attempt >= maxRetries) {
        logInfo("Exceeded max DB connection attempts. Exiting.");
        server.close(() => {
          process.exit(1);
        });
        return;
      }
      await wait(retryDelay);
    }
  }
  /* eslint-enable no-await-in-loop */
};

connectDatabase();
