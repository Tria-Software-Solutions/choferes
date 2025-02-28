import { HoursWorked } from "../models/HoursWorked";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";

export const createHoursWorked = async (data: Omit<HoursWorked, "id">) => {
  const newHoursWorked = await HoursWorked.create(data);
  await newHoursWorked.reload();
  return newHoursWorked;
};

export const getAllHoursWorked = async () => {
  return await HoursWorked.findAll({
    include: [
      { model: Employee, attributes: ["firstName", "lastName"] },
      { model: Schedule, attributes: ["day", "label", "hours"] },
    ],
  });
};

export const getHoursWorkedById = async (id: number) => {
  return await HoursWorked.findByPk(id, {
    include: [
      { model: Employee, attributes: ["firstName", "lastName"] },
      { model: Schedule, attributes: ["day", "label", "hours"] },
    ],
  });
};

export const updateHoursWorked = async (
  id: number,
  data: Omit<HoursWorked, "id">
) => {
  await HoursWorked.update(data, { where: { id } });
  return HoursWorked.findByPk(id);
};

export const deleteHoursWorked = async (id: number) => {
  return await HoursWorked.destroy({ where: { id } });
};
