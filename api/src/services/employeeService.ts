import { Op } from "sequelize";
import { Employee } from "../models/Employee";
import { HoursWorked } from "../models/HoursWorked";

export const getEmployees = async (page = 1, limit = 25, search?: string) => {
  const offset = (page - 1) * limit;

  const whereClause = search
    ? {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};

  const { count, rows } = await Employee.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [
      ["firstName", "ASC"],
      ["lastName", "ASC"],
    ],
    attributes: ["id", "firstName", "lastName", "createdAt", "updatedAt"],
  });

  return {
    employees: rows,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    hasNextPage: page * limit < count,
    hasPrevPage: page > 1,
  };
};

export const getEmployeeById = async (id: number) =>
  Employee.findByPk(id, {
  attributes: ["id", "firstName", "lastName", "createdAt", "updatedAt"],
});

export const createEmployee = async (data: Omit<Employee, "id">) => {
  const newEmployee = await Employee.create(data);
  return newEmployee;
};

export const updateEmployee = async (id: number, data: Omit<Employee, "id">) => {
  const [updatedRows] = await Employee.update(data, {
    where: { id },
    returning: true,
  });

  if (updatedRows === 0) {
    throw new Error("Employee not found");
  }

  return Employee.findByPk(id);
};

export const deleteEmployee = async (id: number) => {
  const deletedRows = await Employee.destroy({ where: { id } });

  if (deletedRows === 0) {
    throw new Error("Employee not found");
  }

  return { success: true, deletedRows };
};

export const getEmployeesWithRelations = async (includeHoursWorked = false) => {
  const include: any[] = [];

  if (includeHoursWorked) {
    include.push({
      model: HoursWorked,
      as: "hoursWorked",
      attributes: ["id", "date", "scheduleId"],
      separate: true,
      limit: 100,
    });
  }

  return Employee.findAll({
    include,
    order: [
      ["firstName", "ASC"],
      ["lastName", "ASC"],
    ],
    attributes: ["id", "firstName", "lastName"],
  });
};
