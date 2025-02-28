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
  data: Omit<MonthlySummary, "id">
) => {
  await MonthlySummary.update(data, { where: { id } });
  return MonthlySummary.findByPk(id);
};

export const deleteMonthlySummary = async (id: number) => {
  return MonthlySummary.destroy({ where: { id } });
};
