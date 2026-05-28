// Service for business logic and database operations related to monthly summaries
import { MonthlySummary } from "../models/MonthlySummary";

// Get all monthly summaries
export const getMonthlySummaries = async () => MonthlySummary.findAll();

// Get the current monthly summary for an employee, month, and year
export const getCurrentMonthlySummary = async (employeeId: number, month: number, year: number) =>
  MonthlySummary.findOne({
    where: { employeeId, month, year },
  });

// Get all monthly summaries for a specific employee
export const getMonthlySummariesByEmployee = async (employeeId: number) =>
  MonthlySummary.findAll({
    where: { employeeId },
  });

// Get all monthly summaries for a specific month and year
export const getMonthlySummariesByMonth = async (month: number, year: number) =>
  MonthlySummary.findAll({
    where: { month, year },
  });

// Create a new monthly summary (upserts on unique constraint conflict)
export const createMonthlySummary = async (data: Omit<MonthlySummary, "id">) => {
  const [newMonthlySummary] = await MonthlySummary.upsert(data);
  return newMonthlySummary;
};

// Update a monthly summary by its ID
export const updateMonthlySummary = async (id: number, data: Omit<MonthlySummary, "id">) => {
  await MonthlySummary.update(data, { where: { id } });
  return MonthlySummary.findByPk(id);
};

// Delete a monthly summary by its ID
export const deleteMonthlySummary = async (id: number) => MonthlySummary.destroy({ where: { id } });

// Delete all monthly summaries
export const deleteAllMonthlySummaries = async () => MonthlySummary.destroy({ where: {} });
