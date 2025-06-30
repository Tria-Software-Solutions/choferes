"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const healthService_1 = require("../services/healthService");
const healthCheck = (req, res) => {
  const healthStatus = (0, healthService_1.checkHealth)();
  res.status(200).json(healthStatus);
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=healtController.js.map
