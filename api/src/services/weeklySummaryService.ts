import { WeeklySummary } from "../models/WeeklySummary";

export const getWeeklySummaries = async () => {
  return WeeklySummary.findAll();
};

export const getCurrentWeeklySummary = async (
  employeeId: number,
  weekNumber: number,
  month: number,
  year: number
) => {
  return WeeklySummary.findOne({
    where: { employeeId, weekNumber, month, year },
  });
};

export const hasWorkedCurrenWeeklySummary = async (
  employeeId: number,
  weekNumber: number,
  month: number,
  year: number
): Promise<boolean> => {
  const summary = await WeeklySummary.findOne({
    where: { employeeId, weekNumber, month, year },
  });
  return !!summary;
};

export const createWeeklySummary = async (data: Omit<WeeklySummary, "id">) => {
  return await WeeklySummary.create(data);
};

export const updateWeeklySummary = async (
  id: number,
  data: Omit<WeeklySummary, "id">
) => {
  await WeeklySummary.update(data, { where: { id } });
  return WeeklySummary.findByPk(id);
};

export const deleteWeeklySummary = async (id: number) => {
  return WeeklySummary.destroy({ where: { id } });
};
