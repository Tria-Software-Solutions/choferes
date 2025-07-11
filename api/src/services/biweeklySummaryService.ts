// Service for business logic and database operations related to biweekly summaries
import { BiweeklySummary } from "../models/BiweeklySummary";

// Get all biweekly summaries
export const getBiweeklySummaries = async () => BiweeklySummary.findAll();

// Get a biweekly summary by its ID
export const getBiweeklySummaryById = async (id: number) => BiweeklySummary.findByPk(id);

// Get all biweekly summaries for a specific employee
export const getBiweeklySummariesByEmployee = async (employeeId: number) =>
  BiweeklySummary.findAll({
    where: { employeeId },
  });

// Get all biweekly summaries for a specific period and year
export const getBiweeklySummariesByPeriod = async (period: number, year: number) =>
  BiweeklySummary.findAll({
    where: { period, year },
  });

// Get the current biweekly summary for an employee, period, month, and year
export const getCurrentBiweeklySummary = async (
  employeeId: number,
  period: number,
  month: number,
  year: number,
) =>
  BiweeklySummary.findOne({
    where: {
      employeeId,
      period,
      month,
      year,
    },
  });

// Create a new biweekly summary
export const createBiweeklySummary = async (data: Omit<BiweeklySummary, "id">) => {
  const newBiweeklySummary = await BiweeklySummary.create(data);
  await newBiweeklySummary.reload();
  return newBiweeklySummary;
};

// Update a biweekly summary by its ID
export const updateBiweeklySummary = async (id: number, data: Omit<BiweeklySummary, "id">) => {
  await BiweeklySummary.update(data, { where: { id } });
  return BiweeklySummary.findByPk(id);
};

// Delete a biweekly summary by its ID
export const deleteBiweeklySummary = async (id: number) =>
  BiweeklySummary.destroy({ where: { id } });

// Delete all biweekly summaries
export const deleteAllBiweeklySummaries = async () => BiweeklySummary.destroy({ where: {} });
