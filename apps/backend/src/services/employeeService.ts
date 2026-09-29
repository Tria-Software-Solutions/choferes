// Service for business logic and database operations related to employees
// Note: Sequelize v3 uses string operators ($between, $iLike, $or). Using inline types instead.
// eslint-disable-next-line import/no-named-as-default
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import { EMPLOYEE_POSITIONS } from "@choferes/shared";
import Employee from "../models/Employee";
import { HoursWorked } from "../models/HoursWorked";
import { Role } from "../models/Role";
import User from "../models/User";
import { ServiceError } from "../utils/errors";
import type { AuthenticatedUser } from "../middleware/authorize";
import { checkRoleGrant } from "./accessGrantService";
import {
  applyAccountRole,
  assignPositionRoleIfMissing,
  planAccountRoleChange,
  resolveRoleForPosition,
} from "./positionRoleService";
import { assignRole } from "./userRoleService";
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

  const where: Record<string, any> = { ...(searchWhere ?? {}) };
  // Optional active/inactive filter ("true"/"false"), validated by the route.
  if (query.isActive === "true" || query.isActive === "false") {
    where.isActive = query.isActive === "true";
  }

  const options: Record<string, any> = {
    where,
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

// Fields a client is allowed to set on an employee. Prevents mass-assignment
// of unknown columns (and keeps the payload surface predictable).
const EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "avatar",
  "hourlyRate",
  "vacationDays",
  "contractStartDate",
  "terminationDate",
  "terminationReason",
  "terminationNotes",
  "position",
  "gender",
  "nationalId",
  "primaryPhone",
  "secondaryPhone",
  "scheduledTerminationDate",
  "scheduledTerminationReason",
] as const;

const GENDERS = new Set(["Masculino", "Femenino"]);

const TERMINATION_REASONS = new Set([
  "renuncia",
  "despido",
  "mutuo_acuerdo",
  "fin_contrato",
  "jubilacion",
  "fallecimiento",
  "otro",
]);

const pickEditableFields = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    EDITABLE_FIELDS.filter((field) => data[field] !== undefined).map((field) => [
      field,
      data[field],
    ]),
  );

// Garantiza que los valores "controlados" caigan fuera del rango esperado
// queden como null en lugar de persistir basura.
const DIGIT_ONLY_FIELDS = ["nationalId", "primaryPhone", "secondaryPhone"] as const;

// La máscara (cédula, teléfonos) es solo de la vista: si el cliente manda
// guiones se quitan antes de tocar la base.
const sanitizeControlledValues = (clean: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = { ...clean };
  DIGIT_ONLY_FIELDS.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = (sanitized[field] as string).replace(/\D/g, "") || null;
    }
  });
  if (sanitized.gender != null && !GENDERS.has(String(sanitized.gender))) {
    sanitized.gender = null;
  }
  // El puesto es obligatorio y define el rol de acceso de la cuenta, así que un
  // valor nulo o desconocido se rechaza en vez de guardarse como null (lo que
  // además violaría el NOT NULL de employees.position).
  if (
    sanitized.position !== undefined &&
    !(EMPLOYEE_POSITIONS as readonly string[]).includes(String(sanitized.position))
  ) {
    throw new ServiceError(400, "El puesto es requerido y debe ser uno de los puestos válidos");
  }
  return sanitized;
};

// Creates a new employee and reloads the instance
export const createEmployee = async (data: Record<string, unknown>) => {
  const clean = sanitizeControlledValues(pickEditableFields(data));
  const newEmployee = await Employee.create(clean as any);
  await newEmployee.reload();
  return newEmployee;
};

// Updates employee data by ID (partial update — only provided fields change).
// The active status is derived from the termination date so it can never drift.
// Changing the position also moves the linked account to the role of the new
// position (a supervisor always ends up with the Supervisor role). When `actor`
// is given, the change is refused if it would hand out a role the actor could
// not assign by hand.
export const updateEmployee = async (
  id: number,
  data: Record<string, unknown>,
  actor?: AuthenticatedUser,
) => {
  const clean = sanitizeControlledValues(pickEditableFields(data));

  if (
    clean.terminationReason != null &&
    !TERMINATION_REASONS.has(String(clean.terminationReason))
  ) {
    clean.terminationReason = null;
  }

  if (clean.terminationDate !== undefined) {
    clean.isActive = !clean.terminationDate;
    // When a real termination is set, clear any pending scheduled one.
    if (clean.terminationDate) {
      clean.scheduledTerminationDate = null;
      clean.scheduledTerminationReason = null;
    }
  }
  // Validate scheduled termination reason the same way as the regular one.
  if (
    clean.scheduledTerminationReason != null &&
    !TERMINATION_REASONS.has(String(clean.scheduledTerminationReason))
  ) {
    clean.scheduledTerminationReason = null;
  }

  // Rol que exige el nuevo puesto sobre la cuenta vinculada (se valida antes de
  // guardar nada para no dejar el puesto cambiado con un rol rechazado).
  const roleChange =
    clean.position !== undefined
      ? await planAccountRoleChange(id, (clean.position as string | null) ?? null)
      : null;
  if (roleChange && actor) {
    const denial = await checkRoleGrant(actor, roleChange.role.id);
    if (denial) {
      throw new ServiceError(
        denial.status,
        `No se puede cambiar el puesto: la cuenta del empleado pasaría a tener el rol "${roleChange.role.name}". ${denial.message}.`,
      );
    }
  }

  if (Object.keys(clean).length > 0) {
    await Employee.update(clean, { where: { id } });
  }
  if (roleChange) {
    await applyAccountRole(roleChange.userId, roleChange.role.id);
  }
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

// Contraseña temporal que cumple la política (mayúscula, minúscula, dígito y
// símbolo) y sale de un generador criptográfico, no de Math.random.
const generateTempPassword = (): string => {
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "@$!%*?&";
  const all = lower + upper + digits + symbols;
  const pick = (chars: string) => chars[crypto.randomInt(chars.length)];
  const chars = [pick(lower), pick(upper), pick(digits), pick(symbols)];
  while (chars.length < 12) chars.push(pick(all));
  // Fisher-Yates para que los caracteres obligatorios no queden al inicio.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

// Crea o enlaza un usuario al empleado (botón "Activar acceso al sistema").
// El vínculo vive en `users.employeeId` (un empleado -> 0 o 1 cuenta), por lo
// que se busca al usuario por ese campo, no en el modelo Employee.
// Si ya existe una cuenta, se devuelve sin crear nada (created: false) — pero
// se le asigna el rol de su puesto si quedó sin ninguno (cuentas previas al
// arreglo de user_role).
// La cuenta nueva recibe el rol que corresponde al puesto del empleado
// (supervisor → Supervisor). El puesto es obligatorio.
export const linkEmployeeToUser = async (employeeId: number, actor?: AuthenticatedUser) => {
  const employee = await Employee.findByPk(employeeId, {
    attributes: ["id", "firstName", "lastName", "email", "position"],
  });
  if (!employee) throw new ServiceError(404, "Empleado no encontrado");

  const existing = await User.findOne({ where: { employeeId: employee.id } });
  if (existing) {
    // Cuentas creadas antes del arreglo quedaron sin rol: se les asigna el
    // de su puesto la primera vez que se vuelve a enlazar.
    await assignPositionRoleIfMissing(existing.id, employee.position);
    return { user: existing, created: false };
  }

  const role = await resolveRoleForPosition(employee.position);
  if (actor) {
    const denial = await checkRoleGrant(actor, role.id);
    if (denial) {
      throw new ServiceError(
        denial.status,
        `No se puede activar el acceso: el puesto del empleado le da el rol "${role.name}". ${denial.message}.`,
      );
    }
  }

  // Username/email pueden colisionar con cuentas ya existentes: se agrega un
  // sufijo numérico hasta encontrar uno libre.
  const baseUsername =
    (employee.email && employee.email.split("@")[0]) || `empleado-${employee.id}`;

  const findUnique = async <T>(
    check: (value: string) => Promise<T | null>,
    base: string,
  ): Promise<string> => {
    let value = base;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop -- sequential DB lookups are intentional
    while (await check(value)) {
      value = `${base}${i}`;
      i += 1;
    }
    return value;
  };

  const username = await findUnique((v) => User.findOne({ where: { username: v } }), baseUsername);

  const email = await findUnique(
    (v) => User.findOne({ where: { email: v } }),
    employee.email || `${username}@example.com`,
  );

  // Contraseña temporal: se guarda hasheada (el login la compara con bcrypt)
  // y solo se devuelve en texto plano una vez, para entregarla al empleado.
  // La contraseña principal se inicializa con otro valor aleatorio que nadie
  // conoce: el acceso inicial es solo con la temporal y se revoca al cambiarla.
  const tempPassword = generateTempPassword();
  const hashedTemporal = await bcrypt.hash(tempPassword, 10);
  const hashedPassword = await bcrypt.hash(generateTempPassword(), 10);

  const user = await User.create({
    firstName: employee.firstName,
    lastName: employee.lastName,
    username,
    email,
    password: hashedPassword,
    temporalPassword: hashedTemporal,
    isActive: true,
    employeeId: employee.id,
  });

  // Sin esto la cuenta nacía sin permisos (no podía ver ni Tareas/Perfil).
  await assignRole(user.id, role.id);

  return { user, created: true, tempPassword };
};

const ROLES_INCLUDE = {
  model: Role,
  as: "roles",
  attributes: ["id", "name"],
  through: { attributes: [] },
};

export interface EmployeeAccess {
  hasUser: boolean;
  userId: number | null;
  username: string | null;
  roles: { id: number; name: string }[];
  /** true cuando la cuenta existe pero quedó sin ningún rol. */
  needsRole: boolean;
}

// Cuenta de acceso al sistema del empleado (o vacío si no tiene). La ficha la
// usa para avisar cuando la cuenta quedó sin rol.
export const getEmployeeAccess = async (employeeId: number): Promise<EmployeeAccess> => {
  const employee = await Employee.findByPk(employeeId, { attributes: ["id"] });
  if (!employee) throw new ServiceError(404, "Empleado no encontrado");

  const user = await User.findOne({
    where: { employeeId: employee.id },
    attributes: ["id", "username"],
    include: [ROLES_INCLUDE],
  });

  if (!user) {
    return { hasUser: false, userId: null, username: null, roles: [], needsRole: false };
  }

  const roles = (user.roles ?? []).map((role) => ({ id: role.id, name: role.name }));
  return {
    hasUser: true,
    userId: user.id,
    username: user.username,
    roles,
    needsRole: roles.length === 0,
  };
};

// Asigna a la cuenta del empleado el rol de su puesto cuando quedó sin ninguno.
// Idempotente: si ya tiene rol no cambia nada.
export const assignDefaultRoleToEmployeeUser = async (
  employeeId: number,
): Promise<EmployeeAccess> => {
  const employee = await Employee.findByPk(employeeId, { attributes: ["id", "position"] });
  if (!employee) throw new ServiceError(404, "Empleado no encontrado");

  const user = await User.findOne({ where: { employeeId: employee.id }, attributes: ["id"] });
  if (!user) {
    throw new ServiceError(400, "El empleado no tiene una cuenta de acceso al sistema");
  }

  await assignPositionRoleIfMissing(user.id, employee.position);
  return getEmployeeAccess(employeeId);
};

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

// Processes employees whose scheduledTerminationDate has arrived: sets them
// as terminated and clears the scheduled fields. Called by the daily scheduler.
export const processScheduledTerminations = async (): Promise<number> => {
  const today = new Date().toISOString().slice(0, 10);
  const due = await Employee.findAll({
    where: {
      scheduledTerminationDate: { $lte: today },
      isActive: true,
    } as Record<string, unknown>,
  });
  if (due.length === 0) return 0;
  await Promise.all(
    due.map((employee) =>
      Employee.update(
        {
          terminationDate: employee.scheduledTerminationDate,
          terminationReason: employee.scheduledTerminationReason ?? "fin_contrato",
          isActive: false,
          scheduledTerminationDate: null,
          scheduledTerminationReason: null,
        },
        { where: { id: employee.id } },
      ),
    ),
  );
  return due.length;
};
