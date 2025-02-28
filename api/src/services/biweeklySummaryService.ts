import { BiweeklySummary } from "../models/BiweeklySummary";

export const createBiweeklySummary = async (
  data: Omit<BiweeklySummary, "id">
) => {
  const newBiweeklySummary = await BiweeklySummary.create(data);
  await newBiweeklySummary.reload();
  return newBiweeklySummary;
};

export const getAllBiweeklySummaries = async () => {
  return BiweeklySummary.findAll();
};

export const getBiweeklySummaryById = async (id: number) => {
  return BiweeklySummary.findByPk(id);
};

export const updateBiweeklySummary = async (
  id: number,
  data: Omit<BiweeklySummary, "id">
) => {
  await BiweeklySummary.update(data, { where: { id } });
  return BiweeklySummary.findByPk(id);
};

export const deleteBiweeklySummary = async (id: number) => {
  return BiweeklySummary.destroy({ where: { id } });
};
