// Service for application health check utility
import sequelize from "../config/database";

interface HealthStatus {
  status: "OK" | "ERROR";
  timestamp: string;
  database: {
    status: "OK" | "ERROR";
    message?: string;
  };
  environment: {
    nodeEnv: string;
    hasJwtSecret: boolean;
    hasJwtRefreshSecret: boolean;
    hasDatabaseConfig: boolean;
  };
}

const checkHealth = async (): Promise<HealthStatus> => {
  const healthStatus: HealthStatus = {
    status: "OK",
    timestamp: new Date().toISOString(),
    database: {
      status: "OK",
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      hasJwtSecret: !!(process.env.JWT_SECRET_KEY && process.env.JWT_SECRET_KEY.length >= 32),
      hasJwtRefreshSecret: !!(
        process.env.JWT_SECRET_KEY_REFRESH && process.env.JWT_SECRET_KEY_REFRESH.length >= 32
      ),
      hasDatabaseConfig: !!(
        process.env.PGUSER &&
        process.env.PGPASSWORD &&
        process.env.PGDATABASE &&
        process.env.PGHOST
      ),
    },
  };

  // Check database connectivity
  try {
    await sequelize.authenticate();
    healthStatus.database.status = "OK";
    healthStatus.database.message = "Database connection successful";
  } catch (error) {
    healthStatus.database.status = "ERROR";
    healthStatus.database.message =
      error instanceof Error ? error.message : "Unknown database error";
    healthStatus.status = "ERROR";
  }

  // Check if all required environment variables are present
  if (
    !healthStatus.environment.hasJwtSecret ||
    !healthStatus.environment.hasJwtRefreshSecret ||
    !healthStatus.environment.hasDatabaseConfig
  ) {
    healthStatus.status = "ERROR";
  }

  return healthStatus;
};

export default checkHealth;
