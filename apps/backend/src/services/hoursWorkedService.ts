// Note: Sequelize v3 uses string operators. Using inline types instead.
import { HoursWorked } from "../models/HoursWorked";
import { Employee } from "../models/Employee";
import { paginate, getPaginationParams, getSearchParam, QueryParams } from "../utils/pagination";

export const getHoursWorked = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);

  // HoursWorked search is done via the associated Employee model
  const whereClause: Record<string, any> = {};
  const includeWhere: Record<string, any> | undefined = search
    ? {
        $or: [{ firstName: { $iLike: `%${search}%` } }, { lastName: { $iLike: `%${search}%` } }],
      }
    : undefined;

  const options: Record<string, any> = {
    where: whereClause,
    include: [
      {
        model: Employee,
        where: includeWhere,
      },
    ],
    order: [["date", "DESC"]],
  };
  return paginate<HoursWorked>(HoursWorked, options, params);
};

export const getHoursWorkedById = async (id: number) =>
  HoursWorked.findByPk(id, {
    include: [
      {
        model: Employee,
      },
    ],
  });

export const getHoursWorkedByEmployee = async (employeeId: number) =>
  HoursWorked.findAll({
    where: { employeeId },
    include: [
      {
        model: Employee,
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
        $between: [startOfDay, endOfDay],
      },
    },
    include: [
      {
        model: Employee,
      },
    ],
  });
};

export const getHoursWorkedByDateRange = async (startDate: Date, endDate: Date) =>
  HoursWorked.findAll({
    where: {
      date: {
        $between: [startDate, endDate],
      },
    },
    include: [
      {
        model: Employee,
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
