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
exports.deleteEmployee =
  exports.updateEmployee =
  exports.createEmployee =
  exports.getEmployeeById =
  exports.getEmployees =
    void 0;
const employeeService = __importStar(require("../services/employeeService"));
const getEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getEmployees();
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Employees", error });
  }
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const employee = await employeeService.getEmployeeById(id);
    if (employee) {
      return res.status(200).json(employee);
    } else {
      return res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Employee", error });
  }
};
exports.getEmployeeById = getEmployeeById;
const createEmployee = async (req, res) => {
  try {
    const newEmployee = await employeeService.createEmployee(req.body);
    return res.status(201).json(newEmployee);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Employee", error });
  }
};
exports.createEmployee = createEmployee;
const updateEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedEmployee = await employeeService.updateEmployee(id, req.body);
    if (updatedEmployee) {
      return res.status(200).json(updatedEmployee);
    } else {
      return res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating Employee", error });
  }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await employeeService.deleteEmployee(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Employee", error });
  }
};
exports.deleteEmployee = deleteEmployee;
//# sourceMappingURL=employeeController.js.map
