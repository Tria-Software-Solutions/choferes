import { MonthlySummary } from "../models/MonthlySummary";

export const getMonthlySummaries = async () => {
  return MonthlySummary.findAll();
};

export const getCurrentMonthlySummary = async (
  employeeId: number,
  month: number,
  year: number
) => {
  return MonthlySummary.findOne({
    where: { employeeId, month, year },
  });
};

export const createMonthlySummary = async (
  data: Omit<MonthlySummary, "id">
) => {
  const newMonthlySummary = await MonthlySummary.create(data);
  await newMonthlySummary.reload();
  return newMonthlySummary;
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
