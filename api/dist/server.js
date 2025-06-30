"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = require("body-parser");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const hoursWorkedRoutes_1 = __importDefault(require("./routes/hoursWorkedRoutes"));
const weeklySummaryRoutes_1 = __importDefault(require("./routes/weeklySummaryRoutes"));
const biweeklySummaryRoutes_1 = __importDefault(require("./routes/biweeklySummaryRoutes"));
const monthlySummaryRoutes_1 = __importDefault(require("./routes/monthlySummaryRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const vehicleRoutes_1 = __importDefault(require("./routes/vehicleRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const permissionRoutes_1 = __importDefault(require("./routes/permissionRoutes"));
const userRoleRoutes_1 = __importDefault(require("./routes/userRoleRoutes"));
const rolePermissionRoutes_1 = __importDefault(require("./routes/rolePermissionRoutes"));
const database_1 = __importDefault(require("./config/database"));
require("./database/models");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configuraciones de seguridad y performance
app.use(
  (0, helmet_1.default)({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
// Compresión gzip para reducir el tamaño de las respuestas
app.use(
  (0, compression_1.default)({
    level: 6, // Nivel de compresión balanceado
    threshold: 1024, // Comprimir solo archivos mayores a 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression_1.default.filter(req, res);
    },
  }),
);
// Rate limiting para prevenir abuso (solo en producción)
const limiter = (0, express_rate_limit_1.default)({
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
const authLimiter = (0, express_rate_limit_1.default)({
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
const allowedOrigins = ["http://localhost:3000", process.env.REACT_APP_UI_URL].filter(Boolean);
app.use(
  (0, cors_1.default)({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  }),
);
app.use((0, cookie_parser_1.default)());
app.use((0, body_parser_1.json)({ limit: "10mb" }));
app.use((0, body_parser_1.urlencoded)({ extended: true, limit: "10mb" }));
// Headers de seguridad adicionales
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/health", healthRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/roles", roleRoutes_1.default);
app.use("/api/permissions", permissionRoutes_1.default);
app.use("/api/user-role", userRoleRoutes_1.default);
app.use("/api/role-permission", rolePermissionRoutes_1.default);
app.use("/api/employees", employeeRoutes_1.default);
app.use("/api/hours", hoursWorkedRoutes_1.default);
app.use("/api/weekly-summary", weeklySummaryRoutes_1.default);
app.use("/api/biweekly-summary", biweeklySummaryRoutes_1.default);
app.use("/api/monthly-summary", monthlySummaryRoutes_1.default);
app.use("/api/schedules", scheduleRoutes_1.default);
app.use("/api/vehicles", vehicleRoutes_1.default);
app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  } else {
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});
database_1.default
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map
