import { WeeklySummary } from "../models/WeeklySummary";

export const createWeeklySummary = async (data: Omit<WeeklySummary, "id">) => {
  const newWeeklySummary = await WeeklySummary.create(data);
  await newWeeklySummary.reload();
  return newWeeklySummary;
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
