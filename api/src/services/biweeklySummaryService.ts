import { BiweeklySummary } from "../models/BiweeklySummary";

export const getBiweeklySummaries = async () => BiweeklySummary.findAll();

export const getCurrentBiweeklySummary = async (
  employeeId: number,
  biweekNumber: number,
  month: number,
  year: number,
) =>
  BiweeklySummary.findOne({
  where: {
    employeeId,
    biweekNumber,
    month,
    year,
  },
});

export const createBiweeklySummary = async (data: Omit<BiweeklySummary, "id">) => {
  const newBiweeklySummary = await BiweeklySummary.create(data);
  await newBiweeklySummary.reload();
  return newBiweeklySummary;
};

export const updateBiweeklySummary = async (id: number, data: Omit<BiweeklySummary, "id">) => {
  await BiweeklySummary.update(data, { where: { id } });
  return BiweeklySummary.findByPk(id);
};

export const deleteBiweeklySummary = async (id: number) =>
  BiweeklySummary.destroy({ where: { id } });
