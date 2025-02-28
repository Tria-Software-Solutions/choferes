import { WeeklySummary } from "../models/WeeklySummary";

export const createWeeklySummary = async (data: Omit<WeeklySummary, "id">) => {
  return await WeeklySummary.create(data);
};

export const getAllWeeklySummaries = async () => {
  return WeeklySummary.findAll();
};

export const getWeeklySummaryById = async (id: number) => {
  return WeeklySummary.findByPk(id);
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
