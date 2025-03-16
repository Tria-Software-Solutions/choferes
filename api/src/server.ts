import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "body-parser";
import authRoutes from "./routes/authRoutes";
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

const allowedOrigins = [
  "http://localhost:3000",
  "https://choferesdealquilercr.vercel.app",
];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
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

app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(error.stack);
    res.status(500).send("Something broke!");
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error: any) => {
    console.error("Error syncing database:", error);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
