import { BiweeklySummary } from "../models/BiweeklySummary";

export const getBiweeklySummaries = async () => {
  return BiweeklySummary.findAll();
};

export const getCurrentBiweeklySummary = async (
  employeeId: number,
  biweekNumber: number,
  month: number,
  year: number
) => {
  return BiweeklySummary.findOne({
    where: { employeeId, biweekNumber, month, year },
  });
};

export const createBiweeklySummary = async (
  data: Omit<BiweeklySummary, "id">
) => {
  return await BiweeklySummary.create(data);
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
