"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule =
  exports.updateSchedule =
  exports.createSchedule =
  exports.getScheduleById =
  exports.getSchedules =
    void 0;
const scheduleService = __importStar(require("../services/scheduleService"));
const getSchedules = async (req, res) => {
  try {
    const schedules = await scheduleService.getSchedules();
    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Schedules", error });
  }
};
exports.getSchedules = getSchedules;
const getScheduleById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const schedule = await scheduleService.getScheduleById(id);
    if (schedule) {
      return res.status(200).json(schedule);
    } else {
      return res.status(404).json({ message: "Schedule not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Schedule", error });
  }
};
exports.getScheduleById = getScheduleById;
const createSchedule = async (req, res) => {
  try {
    const newSchedule = await scheduleService.createSchedule(req.body);
    return res.status(201).json(newSchedule);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Schedule", error });
  }
};
exports.createSchedule = createSchedule;
const updateSchedule = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedSchedule = await scheduleService.updateSchedule(id, req.body);
    if (updatedSchedule) {
      return res.status(200).json(updatedSchedule);
    } else {
      return res.status(404).json({ message: "Schedule not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating Schedule", error });
  }
};
exports.updateSchedule = updateSchedule;
const deleteSchedule = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await scheduleService.deleteSchedule(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "Schedule not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Schedule", error });
  }
};
exports.deleteSchedule = deleteSchedule;
//# sourceMappingURL=scheduleController.js.map
