import { BiweeklySummary } from "../models/BiweeklySummary";

export const getBiweeklySummaries = async () => BiweeklySummary.findAll();

export const getBiweeklySummaryById = async (id: number) => BiweeklySummary.findByPk(id);

export const getBiweeklySummariesByEmployee = async (employeeId: number) =>
  BiweeklySummary.findAll({
    where: { employeeId },
  });

export const getBiweeklySummariesByPeriod = async (period: number, year: number) =>
  BiweeklySummary.findAll({
    where: { period, year },
  });

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
