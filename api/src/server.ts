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

dotenv.config();

const app = express();

// Configuraciones de seguridad y performance
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
          "https://choferesdealquilercr.vercel.app",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Compresión gzip para reducir el tamaño de las respuestas
app.use(
  compression({
    level: 6, // Nivel de compresión balanceado
    threshold: 1024, // Comprimir solo archivos mayores a 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Rate limiting para prevenir abuso (solo en producción)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo 1000 requests por ventana de tiempo (aumentado para desarrollo)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Solo aplicar rate limiting en producción
if (process.env.NODE_ENV === "production") {
  app.use("/api/", limiter);
}

// Rate limiting más estricto para autenticación (solo en producción)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo 20 intentos de login por ventana de tiempo (aumentado para desarrollo)
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Solo aplicar rate limiting de auth en producción
if (process.env.NODE_ENV === "production") {
  app.use("/api/auth", authLimiter);
}

const allowedOrigins = [
  "http://localhost:3000",
  "https://choferesdealquilercr.vercel.app",
  "https://choferesdealquilercr.vercel.app/",
  process.env.REACT_APP_UI_URL,
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como mobile apps o Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked request from origin: ${origin}`);
      console.log("Allowed origins:", allowedOrigins);
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

// Headers de seguridad adicionales
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
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/user-role", userRoleRoutes);
app.use("/api/role-permission", rolePermissionRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/hours", hoursWorkedRoutes);
app.use("/api/weekly-summary", weeklySummaryRoutes);
app.use("/api/biweekly-summary", biweeklySummaryRoutes);
app.use("/api/monthly-summary", monthlySummaryRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.use((error: Error, req: express.Request, res: express.Response) => {
  if (process.env.NODE_ENV === "production") {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
  console.error(error.stack);
  return res.status(500).json({ error: error.message });
});

sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error: unknown) => {
    console.error("Error syncing database:", error);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
