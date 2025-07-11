import { Op } from "sequelize";
import { HoursWorked } from "../models/HoursWorked";
import { Employee } from "../models/Employee";

export const getHoursWorked = async () =>
  HoursWorked.findAll({
    include: [
      {
        model: Employee,
        as: "employee",
      },
    ],
  });

export const getHoursWorkedById = async (id: number) =>
  HoursWorked.findByPk(id, {
    include: [
      {
        model: Employee,
        as: "employee",
      },
    ],
  });

export const getHoursWorkedByEmployee = async (employeeId: number) =>
  HoursWorked.findAll({
    where: { employeeId },
    include: [
      {
        model: Employee,
        as: "employee",
      },
    ],
  });

export const getHoursWorkedByDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return HoursWorked.findAll({
    where: {
      date: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    include: [
      {
        model: Employee,
        as: "employee",
      },
    ],
  });
};

export const getHoursWorkedByDateRange = async (startDate: Date, endDate: Date) =>
  HoursWorked.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: Employee,
        as: "employee",
      },
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

// Delete all hours worked records
export const deleteAllHoursWorked = async () => HoursWorked.destroy({ where: {} });
