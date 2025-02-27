import { MonthlySummary } from '../models/MonthlySummary';

export const createMonthlySummary = async (data: Omit<MonthlySummary, "id">) => {
  return MonthlySummary.create(data);
};

export const getAllMonthlySummaries = async () => {
  return MonthlySummary.findAll();
};

export const getMonthlySummaryById = async (id: number) => {
  return MonthlySummary.findByPk(id);
};

export const updateMonthlySummary = async (
  id: number,
  data: { month?: number; year?: number; totalHours?: number }
) => {
  await MonthlySummary.update(data, { where: { id } });
  return MonthlySummary.findByPk(id);
};

export const deleteMonthlySummary = async (id: number) => {
  return MonthlySummary.destroy({ where: { id } });
};
