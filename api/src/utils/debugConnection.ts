// Utility script to debug database connection and environment variables
import dotenv from "dotenv";
import sequelize from "../config/database";

dotenv.config();

const debugConnection = async () => {
  console.log("=== Environment Variables Check ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("JWT_SECRET_KEY exists:", !!process.env.JWT_SECRET_KEY);
  console.log("JWT_SECRET_KEY length:", process.env.JWT_SECRET_KEY?.length || 0);
  console.log("JWT_SECRET_KEY_REFRESH exists:", !!process.env.JWT_SECRET_KEY_REFRESH);
  console.log("JWT_SECRET_KEY_REFRESH length:", process.env.JWT_SECRET_KEY_REFRESH?.length || 0);
  console.log("PGUSER exists:", !!process.env.PGUSER);
  console.log("PGPASSWORD exists:", !!process.env.PGPASSWORD);
  console.log("PGDATABASE exists:", !!process.env.PGDATABASE);
  console.log("PGHOST exists:", !!process.env.PGHOST);

  console.log("\n=== Database Connection Test ===");
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful");

    // Test a simple query
    const result = await sequelize.query("SELECT NOW() as current_time");
    console.log("✅ Database query successful:", result[0]);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }

  console.log("\n=== Model Associations Check ===");
  try {
    // Import models to ensure they're loaded
    const { User } = await import("../models/User");
    const { Role } = await import("../models/Role");
    const { Permission } = await import("../models/Permission");

    console.log("✅ Models loaded successfully");
    console.log("User model associations:", Object.keys(User.associations || {}));
    console.log("Role model associations:", Object.keys(Role.associations || {}));
    console.log("Permission model associations:", Object.keys(Permission.associations || {}));
  } catch (error) {
    console.error("❌ Model loading failed:", error);
  }
};

// Run the debug function if this file is executed directly
if (require.main === module) {
  debugConnection()
    .then(() => {
      console.log("\n=== Debug complete ===");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Debug failed:", error);
      process.exit(1);
    });
}

export default debugConnection;
