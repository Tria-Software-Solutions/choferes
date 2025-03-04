"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
app.use((0, body_parser_1.urlencoded)({ extended: true }));
app.use("/api/users", userRoutes_1.default);
app.use("/api/roles", roleRoutes_1.default);
app.use("/api/permissions", permissionRoutes_1.default);
app.use("/api/user-role", userRoleRoutes_1.default);
app.use("/api/role-permission", rolePermissionRoutes_1.default);
app.use('/api/employees', employeeRoutes_1.default);
app.use('/api/hours', hoursWorkedRoutes_1.default);
app.use('/api/weekly-summary', weeklySummaryRoutes_1.default);
app.use('/api/biweekly-summary', biweeklySummaryRoutes_1.default);
app.use('/api/monthly-summary', monthlySummaryRoutes_1.default);
app.use('/api/schedules', scheduleRoutes_1.default);
app.use('/api/vehicles', vehicleRoutes_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
database_1.default.sync()
    .then(() => {
    console.log('Database synchronized');
})
    .catch((error) => {
    console.error('Error syncing database:', error);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
