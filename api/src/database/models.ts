import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { UserRole } from "../models/UserRole";
import { RolePermission } from "../models/RolePermission";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";
import { HoursWorked } from "../models/HoursWorked";
import { Vehicle } from "../models/Vehicle";
import { WeeklySummary } from "../models/WeeklySummary";
import { MonthlySummary } from "../models/MonthlySummary";
import { BiweeklySummary } from "../models/BiweeklySummary";
import setupAssociations from "./associations";

setupAssociations();

export {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Employee,
  Schedule,
  HoursWorked,
  Vehicle,
  WeeklySummary,
  MonthlySummary,
  BiweeklySummary,
};
