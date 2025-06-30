"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Schedule extends sequelize_1.Model {}
exports.Schedule = Schedule;
Schedule.init(
  {
    id: {
      type: sequelize_1.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    days: {
      type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
      allowNull: false,
    },
    label: {
      type: sequelize_1.DataTypes.STRING,
      allowNull: false,
    },
    hours: {
      type: sequelize_1.DataTypes.INTEGER,
      allowNull: false,
    },
    specialSchedule: {
      type: sequelize_1.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: database_1.default,
    modelName: "Schedule",
    tableName: "schedule",
  },
);
//# sourceMappingURL=Schedule.js.map
