// Service for business logic and database operations related to weekly summaries
import { WeeklySummary } from "../models/WeeklySummary";

// Get all weekly summaries
export const getWeeklySummaries = async () => WeeklySummary.findAll();

// Get a weekly summary by its ID
export const getWeeklySummaryById = async (id: number) => WeeklySummary.findByPk(id);

// Get all weekly summaries for a specific employee
export const getWeeklySummariesByEmployee = async (employeeId: number) =>
  WeeklySummary.findAll({
    where: { employeeId },
  });

// Get all weekly summaries for a specific week and year
export const getWeeklySummariesByWeek = async (week: number, year: number) =>
  WeeklySummary.findAll({
    where: { week, year },
  });

// Get the current weekly summary for an employee, week, and year
export const getCurrentWeeklySummary = async (employeeId: number, week: number, year: number) =>
  WeeklySummary.findOne({
    where: { employeeId, week, year },
  });

// Check if an employee has worked in the current weekly summary
export const hasWorkedCurrenWeeklySummary = async (
  employeeId: number,
  weekNumber: number,
  month: number,
  year: number,
): Promise<boolean> => {
  const summary = await WeeklySummary.findOne({
    where: {
      employeeId,
      weekNumber,
      month,
      year,
    },
  });
  return !!summary;
};

// Create a new weekly summary
export const createWeeklySummary = async (data: Omit<WeeklySummary, "id">) => {
  const newWeeklySummary = await WeeklySummary.create(data);
  await newWeeklySummary.reload();
  return newWeeklySummary;
};

// Update a weekly summary by its ID
export const updateWeeklySummary = async (id: number, data: Omit<WeeklySummary, "id">) => {
  await WeeklySummary.update(data, { where: { id } });
  return WeeklySummary.findByPk(id);
};

// Delete a weekly summary by its ID
export const deleteWeeklySummary = async (id: number) => WeeklySummary.destroy({ where: { id } });

// Delete all weekly summaries
export const deleteAllWeeklySummaries = async () => WeeklySummary.destroy({ where: {} });
