// Service for business logic and database operations related to employees
// Note: Sequelize v3 uses string operators ($between, $iLike, $or). Using inline types instead.
// eslint-disable-next-line import/no-named-as-default
import Employee from "../models/Employee";
import { HoursWorked } from "../models/HoursWorked";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

// Fetches all employees with pagination and search
export const getEmployees = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, ["firstName", "lastName", "email"]);

  const options: Record<string, any> = {
    where: searchWhere,
    order: [["firstName", "ASC"]],
  };
  return paginate<Employee>(Employee, options, params);
};

// Fetches an employee by ID with their schedule
export const getEmployeeById = async (id: number) => Employee.findByPk(id);

// Fetches an employee by email with their schedule
export const getEmployeeByEmail = async (email: string) => Employee.findOne({ where: { email } });

// Fetches an employee by phone with their schedule
export const getEmployeeByPhone = async (phone: string) => Employee.findOne({ where: { phone } });

// Fetches an employee by document with their schedule
export const getEmployeeByDocument = async (document: string) =>
  Employee.findOne({ where: { document } });

// Fetches all employees by schedule ID
export const getEmployeesBySchedule = async (scheduleId: number) =>
  Employee.findAll({ where: { scheduleId } });

// Fetches all employees by active/inactive status
export const getEmployeesByStatus = async (status: boolean) =>
  Employee.findAll({ where: { isActive: status } });

// Fetches all employees hired between two dates
export const getEmployeesByHireDate = async (startDate: Date, endDate: Date) =>
  Employee.findAll({
    where: {
      hireDate: {
        $between: [startDate, endDate],
      },
    },
  });

// Fetches all employees with salary in a given range
export const getEmployeesBySalary = async (minSalary: number, maxSalary: number) =>
  Employee.findAll({
    where: {
      salary: {
        $between: [minSalary, maxSalary],
      },
    },
  });

// Fetches employees by various filters (name, email, phone, document, status, schedule)
export const getEmployeesByFilter = async (filter: Record<string, unknown>) => {
  const whereClause: Record<string, unknown> = {};

  if (filter.name) {
    whereClause.name = { $iLike: `%${filter.name}%` };
  }

  if (filter.email) {
    whereClause.email = { $iLike: `%${filter.email}%` };
  }

  if (filter.phone) {
    whereClause.phone = { $iLike: `%${filter.phone}%` };
  }

  if (filter.document) {
    whereClause.document = { $iLike: `%${filter.document}%` };
  }

  if (filter.isActive !== undefined) {
    whereClause.isActive = filter.isActive;
  }

  if (filter.scheduleId) {
    whereClause.scheduleId = filter.scheduleId;
  }

  return Employee.findAll({ where: whereClause });
};

// Creates a new employee and reloads the instance
export const createEmployee = async (data: Omit<Employee, "id">) => {
  const newEmployee = await Employee.create(data);
  await newEmployee.reload();
  return newEmployee;
};

// Updates employee data by ID
export const updateEmployee = async (id: number, data: Omit<Employee, "id">) => {
  await Employee.update(data, { where: { id } });
  return Employee.findByPk(id);
};

// Updates the active status of an employee
export const updateEmployeeStatus = async (id: number, status: boolean) => {
  await Employee.update({ isActive: status }, { where: { id } });
  return Employee.findByPk(id);
};

// Deletes an employee by ID
export const deleteEmployee = async (id: number) => Employee.destroy({ where: { id } });

// Fetches all employees by department, ordered by first name
export const getEmployeesByDepartment = async (department: string) =>
  Employee.findAll({
    where: { department },
    order: [["firstName", "ASC"]],
  });

// Fetches all employees by position, ordered by first name
export const getEmployeesByPosition = async (position: string) =>
  Employee.findAll({
    where: { position },
    order: [["firstName", "ASC"]],
  });

// Fetches employees by a search term (matches multiple fields)
export const getEmployeesBySearch = async (searchTerm: string) =>
  Employee.findAll({
    where: {
      $or: [
        { firstName: { $iLike: `%${searchTerm}%` } },
        { lastName: { $iLike: `%${searchTerm}%` } },
        { email: { $iLike: `%${searchTerm}%` } },
        { phone: { $iLike: `%${searchTerm}%` } },
        { cedula: { $iLike: `%${searchTerm}%` } },
      ],
    },
    order: [["firstName", "ASC"]],
  });

// Fetches employees with related hours worked if requested
export const getEmployeesWithRelations = async (includeHoursWorked = false) => {
  const include: Record<string, any>[] = [];

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
