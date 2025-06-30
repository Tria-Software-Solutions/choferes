import { HoursWorked } from "../models/HoursWorked";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";

export const getHoursWorked = async () =>
  HoursWorked.findAll({
  include: [
    { model: Employee, attributes: ["firstName", "lastName"] },
    { model: Schedule, attributes: ["days", "label", "hours"] },
  ],
});

export const getHoursWorkedById = async (id: number) =>
  HoursWorked.findByPk(id, {
  include: [
    { model: Employee, attributes: ["firstName", "lastName"] },
    { model: Schedule, attributes: ["days", "label", "hours"] },
  ],
});

export const createHoursWorked = async (data: Omit<HoursWorked, "id">) => {
  const newHoursWorked = await HoursWorked.create(data);
  await newHoursWorked.reload();
  return newHoursWorked;
};

export const updateHoursWorked = async (id: number, data: Omit<HoursWorked, "id">) => {
  await HoursWorked.update(data, { where: { id } });
  return HoursWorked.findByPk(id);
};

export const deleteHoursWorked = async (id: number) => HoursWorked.destroy({ where: { id } });
