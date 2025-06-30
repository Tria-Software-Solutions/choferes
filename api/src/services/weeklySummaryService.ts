import { WeeklySummary } from "../models/WeeklySummary";

export const getWeeklySummaries = async () => WeeklySummary.findAll();

export const getWeeklySummaryById = async (id: number) => WeeklySummary.findByPk(id);

export const getWeeklySummariesByEmployee = async (employeeId: number) =>
  WeeklySummary.findAll({
    where: { employeeId },
  });

export const getWeeklySummariesByWeek = async (week: number, year: number) =>
  WeeklySummary.findAll({
    where: { week, year },
  });

export const getCurrentWeeklySummary = async (employeeId: number, week: number, year: number) =>
  WeeklySummary.findOne({
    where: { employeeId, week, year },
  });

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

export const createWeeklySummary = async (data: Omit<WeeklySummary, "id">) => {
  const newWeeklySummary = await WeeklySummary.create(data);
  await newWeeklySummary.reload();
  return newWeeklySummary;
};

export const updateWeeklySummary = async (id: number, data: Omit<WeeklySummary, "id">) => {
  await WeeklySummary.update(data, { where: { id } });
  return WeeklySummary.findByPk(id);
};

export const deleteWeeklySummary = async (id: number) => WeeklySummary.destroy({ where: { id } });
