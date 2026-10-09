// Service for business logic and database operations related to employees
// Note: Sequelize v3 uses string operators ($between, $iLike, $or). Using inline types instead.
// eslint-disable-next-line import/no-named-as-default
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import {
  DEFAULT_NATIONALITY,
  MAX_PLATES_PER_EMPLOYEE,
  NationalIdType,
  computeAccruedVacationDays,
  getEmployeePositions,
  getEmployeePositionsLabel,
  isNationalIdType,
  isValidPlate,
  normalizeNationalId,
  normalizePlate,
  validateNationalId,
} from "@choferes/shared";
import Employee from "../models/Employee";
import { HoursWorked } from "../models/HoursWorked";
import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import User from "../models/User";
import { ServiceError } from "../utils/errors";
import { localDateString } from "../utils/timezone";
import type { AuthenticatedUser } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import { checkRoleGrant } from "./accessGrantService";
import {
  createNotification,
  notifyEmployeeUser,
  notifyManagementRoles,
  notifyAccountRoleChange,
} from "./notificationService";
import {
  applyAccountRoles,
  assignPositionRoleIfMissing,
  normalizePositions,
  planAccountRoleChange,
  resolveRolesForPositions,
} from "./positionRoleService";
import { assignRole } from "./userRoleService";
import sequelize from "../config/database";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

// Columnas sensibles de la ficha y el permiso que las abre.
//
// COMPENSATION (salario y saldo de vacaciones): solo los roles que administran
// la compensación, los que tienen `payments:view` y `vacations:view`, es decir
// Gerencia, SysAdmin y Administrativo.
//
// PRIVACY (dirección y nombre preferido): requiere `employees:view`. No es un
// permiso de escritura a propósito, porque Administrativo los necesita para ver
// sin poder editar.
//
// Estas columnas existían en la respuesta de todos. Un Supervisor no tiene
// ninguno de los dos permisos, pero sí `roles:view`, y el listado de empleados
// se abre con ese permiso para el tablero de Roles: recibía el salario y la
// dirección de todos aunque la tabla no los mostrara.
const SENSITIVE_COLUMNS: Readonly<Record<string, string>> = {
  hourlyRate: PERMISSION_CODES.VIEW_PAYMENTS,
  vacationDays: PERMISSION_CODES.VIEW_VACATIONS,
  address: PERMISSION_CODES.VIEW_EMPLOYEES,
  preferredName: PERMISSION_CODES.VIEW_EMPLOYEES,
};

const grants = (actor: AuthenticatedUser | undefined, permissionCode: string): boolean =>
  Boolean(actor?.permissions.includes("*") || actor?.permissions.includes(permissionCode));

// Columnas que este actor no puede ver.
const columnsToHide = (actor?: AuthenticatedUser): string[] =>
  Object.entries(SENSITIVE_COLUMNS)
    .filter(([, permissionCode]) => !grants(actor, permissionCode))
    .map(([column]) => column);

// El empleado al que pertenece la cuenta del actor (users.employeeId), para
// distinguir "mi ficha" de "la ficha de otro" en el detalle.
const actorEmployeeId = async (actor?: AuthenticatedUser): Promise<number | null> => {
  if (actor?.id == null) return null;
  const user = await User.findByPk(actor.id, { attributes: ["employeeId"] });
  return user?.employeeId ?? null;
};

// Fetches all employees with pagination and search
export const getEmployees = async (query: QueryParams, actor?: AuthenticatedUser) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, ["firstName", "lastName", "email"]);

  const where: Record<string, any> = { ...(searchWhere ?? {}) };
  // Optional active/inactive filter ("true"/"false"), validated by the route.
  if (query.isActive === "true" || query.isActive === "false") {
    where.isActive = query.isActive === "true";
  }

  // Sin excepción para el propio empleado: en un listado cada fila se ve igual.
  // Lo propio se resuelve por sesión en /me/overview.
  const hidden = columnsToHide(actor);

  const options: Record<string, any> = {
    where,
    order: [["firstName", "ASC"]],
    // Se ocultan en el SQL, no se borran después: así no hay forma de que un
    // forget de la limpieza deje la columna en la respuesta.
    ...(hidden.length > 0 ? { attributes: { exclude: hidden } } : {}),
  };
  return paginate<Employee>(Employee, options, params);
};

// Fetches an employee by ID with their schedule
export const getEmployeeById = async (id: number, actor?: AuthenticatedUser) => {
  // En el detalle sí se le concede al propio empleado lo suyo: la dirección y el
  // apodo son suyos, y ocultárselos no protege nada.
  const isSelf = (await actorEmployeeId(actor)) === id;
  const hidden = isSelf ? [] : columnsToHide(actor);
  return Employee.findByPk(id, hidden.length > 0 ? { attributes: { exclude: hidden } } : {});
};

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
  "positions",
  "gender",
  "nationalId",
  "nationalIdType",
  "nationality",
  "birthDate",
  "address",
  "preferredName",
  "vehicles",
  "vehiclePlates",
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
const DIGIT_ONLY_FIELDS = ["primaryPhone", "secondaryPhone"] as const;

// La máscara (cédula, teléfonos) es solo de la vista: si el cliente manda
// guiones se quitan antes de tocar la base.
const sanitizeControlledValues = (
  clean: Record<string, unknown>,
  storedIdType?: NationalIdType,
): Record<string, unknown> => {
  const sanitized = { ...clean };
  DIGIT_ONLY_FIELDS.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = (sanitized[field] as string).replace(/\D/g, "") || null;
    }
  });
  // Documento de identidad: cédula y DIMEX solo llevan dígitos; pasaporte y otros
  // admiten letras. La cédula implica nacionalidad costarricense.
  if (sanitized.nationalIdType !== undefined || sanitized.nationalId !== undefined) {
    const type = (sanitized.nationalIdType ?? storedIdType ?? "cedula") as NationalIdType;
    if (!isNationalIdType(type)) throw new ServiceError(400, "Tipo de documento inválido");
    sanitized.nationalIdType = type;
    if (typeof sanitized.nationalId === "string") {
      const normalized = normalizeNationalId(type, sanitized.nationalId);
      const problem = validateNationalId(type, normalized);
      if (problem) throw new ServiceError(400, problem);
      sanitized.nationalId = normalized || null;
    }
    if (type === "cedula") sanitized.nationality = DEFAULT_NATIONALITY;
  }
  if (typeof sanitized.nationality === "string") {
    sanitized.nationality = sanitized.nationality.toUpperCase();
  }
  if (sanitized.vehicles !== undefined) {
    const entries = Array.isArray(sanitized.vehicles) ? sanitized.vehicles : [];
    const seen = new Set<string>();
    const validTypes = new Set(["car", "moto", "bus", "truck", "bike"]);
    sanitized.vehicles = entries
      .filter((v): v is { plate: string; type: string } => v && typeof v.plate === "string")
      .map((v) => ({
        plate: normalizePlate(v.plate),
        type: validTypes.has(v.type) ? v.type : "car",
      }))
      .filter((v) => isValidPlate(v.plate) && !seen.has(v.plate) && seen.add(v.plate))
      .slice(0, MAX_PLATES_PER_EMPLOYEE);
    // Mantiene vehiclePlates sincronizado para compatibilidad con el legado.
    sanitized.vehiclePlates = (sanitized.vehicles as Array<{ plate: string }>).map((v) => v.plate);
  } else if (sanitized.vehiclePlates !== undefined) {
    const plates = Array.isArray(sanitized.vehiclePlates) ? sanitized.vehiclePlates : [];
    sanitized.vehiclePlates = Array.from(
      new Set(plates.map((plate) => normalizePlate(String(plate))).filter(isValidPlate)),
    ).slice(0, MAX_PLATES_PER_EMPLOYEE);
  }
  if (typeof sanitized.preferredName === "string") {
    sanitized.preferredName = sanitized.preferredName.trim() || null;
  }
  if (typeof sanitized.address === "string") {
    sanitized.address = sanitized.address.trim() || null;
  }
  if (sanitized.gender != null && !GENDERS.has(String(sanitized.gender))) {
    sanitized.gender = null;
  }
  // Los puestos son obligatorios y definen los roles de acceso de la cuenta, así
  // que una lista vacía o con valores desconocidos se rechaza. `position` queda
  // como el puesto principal (el primero) y `positions` como la lista completa.
  const positions = normalizePositions(sanitized);
  if (positions) {
    sanitized.positions = positions;
    [sanitized.position] = positions;
  }
  return sanitized;
};

// Saldo inicial de vacaciones: lo que reconoce la ley (art. 153) por la
// antigüedad desde la fecha de ingreso, en días enteros.
//
// El saldo se guarda en días completos (`employees.vacationDays` es INTEGER) y
// no se captura a mano en el alta: es un dato derivado de la ley. Si el cliente
// manda un valor explícito se respeta (por ejemplo, una carga histórica por
// API); sin fecha de ingreso no hay antigüedad que calcular y el saldo queda
// sin asignar, igual que en el backfill `backfill-employee-vacation-days`.
const initialVacationDays = (data: Record<string, unknown>): number | undefined => {
  if (data.vacationDays !== undefined && data.vacationDays !== null) return undefined;
  const start = data.contractStartDate;
  if (typeof start !== "string" || !start) return undefined;
  return Math.round(computeAccruedVacationDays(start).accruedDays);
};

// Creates a new employee and reloads the instance
export const createEmployee = async (data: Record<string, unknown>) => {
  const clean = sanitizeControlledValues(pickEditableFields(data));
  const vacationDays = initialVacationDays(clean);
  if (vacationDays !== undefined) clean.vacationDays = vacationDays;
  const newEmployee = await Employee.create(clean as any);
  await newEmployee.reload();
  await notifyManagementRoles({
    source: `employee-created:${newEmployee.id}`,
    title: "Empleado registrado",
    message: `Se registró a ${newEmployee.firstName} ${newEmployee.lastName} (${getEmployeePositionsLabel(newEmployee, null) ?? "sin puesto"}).`,
    type: "info",
    category: "employee",
    priority: "medium",
    actionUrl: `/employees/${newEmployee.id}`,
    actionText: "Ver ficha",
  });
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
  // Si solo llega el número de documento, se valida con el tipo ya guardado.
  const picked = pickEditableFields(data);
  const storedIdType =
    picked.nationalId !== undefined && picked.nationalIdType === undefined
      ? ((await Employee.findByPk(id, { attributes: ["id", "nationalIdType"] }))?.nationalIdType as
          NationalIdType | undefined)
      : undefined;
  const clean = sanitizeControlledValues(picked, storedIdType);

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
    clean.positions !== undefined
      ? await planAccountRoleChange(id, clean.positions as string[])
      : null;
  if (roleChange && actor) {
    // Solo se revisan los roles que la cuenta todavía no tiene.
    const currentIds = new Set(
      (await UserRole.findAll({ where: { userId: roleChange.userId } })).map((row) => row.roleId),
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const role of roleChange.roles.filter((target) => !currentIds.has(target.id))) {
      // eslint-disable-next-line no-await-in-loop
      const denial = await checkRoleGrant(actor, role.id);
      if (denial) {
        throw new ServiceError(
          denial.status,
          `No se puede cambiar el puesto: la cuenta del empleado pasaría a tener el rol "${role.name}". ${denial.message}.`,
        );
      }
    }
  }

  if (Object.keys(clean).length > 0) {
    await Employee.update(clean, { where: { id } });
  }
  if (roleChange) {
    await applyAccountRoles(roleChange.userId, roleChange.roles);
  }

  if (clean.terminationDate) {
    const terminated = await Employee.findByPk(id, {
      attributes: ["id", "firstName", "lastName"],
    });
    const terminatedName = terminated
      ? `${terminated.firstName ?? ""} ${terminated.lastName ?? ""}`.trim()
      : `#${id}`;
    await notifyEmployeeUser(id, {
      source: `employee-terminated:${id}`,
      title: "Tu contrato terminó",
      message:
        "Tu relación laboral fue dada por terminada. Comunícate con tu supervisor si tienes dudas.",
      type: "warning",
      category: "employee",
      priority: "high",
      actionUrl: "/my-panel",
      actionText: "Ver mi panel",
    });
    await notifyManagementRoles({
      source: `employee-terminated:${id}`,
      title: "Empleado dado de baja",
      message: `Se marcó el fin de contrato del empleado ${terminatedName}.`,
      type: "warning",
      category: "employee",
      priority: "high",
      actionUrl: `/employees/${id}`,
      actionText: "Ver ficha",
    });
  }
  if (clean.scheduledTerminationDate) {
    await notifyEmployeeUser(id, {
      source: `employee-termination-scheduled:${id}:${clean.scheduledTerminationDate}`,
      title: "Fin de contrato programado",
      message: `Tu contrato tiene programada su finalización el ${String(clean.scheduledTerminationDate).split("-").reverse().join("/")}.`,
      type: "info",
      category: "employee",
      priority: "medium",
      actionUrl: "/my-panel",
      actionText: "Ver mi panel",
    });
  }

  return Employee.findByPk(id);
};

// Updates the active status of an employee
export const updateEmployeeStatus = async (id: number, status: boolean) => {
  await Employee.update({ isActive: status }, { where: { id } });
  return Employee.findByPk(id);
};

// Deletes an employee by ID
export const deleteEmployee = async (id: number) => {
  const existing = await Employee.findByPk(id, { attributes: ["id", "firstName", "lastName"] });
  const result = await Employee.destroy({ where: { id } });
  if (result > 0) {
    const name = existing ? `${existing.firstName ?? ""} ${existing.lastName ?? ""}`.trim() : "";
    await notifyManagementRoles({
      source: `employee-deleted:${id}`,
      title: "Empleado eliminado",
      message: `Se eliminó a ${name || `el empleado #${id}`} de la planilla junto con sus registros asociados.`,
      type: "error",
      category: "employee",
      priority: "high",
      actionUrl: "/employees",
      actionText: "Ver empleados",
    });
  }
  return result;
};

// Fetches all employees by department, ordered by first name
export const getEmployeesByDepartment = async (department: string) =>
  Employee.findAll({
    where: { department },
    order: [["firstName", "ASC"]],
  });

// Fetches all employees by position, ordered by first name
export const getEmployeesByPosition = async (position: string) => {
  const employees = await Employee.findAll({ order: [["firstName", "ASC"]] });
  return employees.filter((employee) => getEmployeePositions(employee).includes(position));
};

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
    attributes: ["id", "firstName", "lastName", "email", "position", "positions"],
  });
  if (!employee) throw new ServiceError(404, "Empleado no encontrado");

  const existing = await User.findOne({ where: { employeeId: employee.id } });
  if (existing) {
    // Cuentas creadas antes del arreglo quedaron sin rol: se les asigna el
    // de su puesto la primera vez que se vuelve a enlazar.
    await assignPositionRoleIfMissing(existing.id, getEmployeePositions(employee));
    return { user: existing, created: false };
  }

  const roles = await resolveRolesForPositions(getEmployeePositions(employee));
  if (actor) {
    // eslint-disable-next-line no-restricted-syntax
    for (const role of roles) {
      // eslint-disable-next-line no-await-in-loop
      const denial = await checkRoleGrant(actor, role.id);
      if (denial) {
        throw new ServiceError(
          denial.status,
          `No se puede activar el acceso: el puesto del empleado le da el rol "${role.name}". ${denial.message}.`,
        );
      }
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
  const hashedTemporal = await bcrypt.hash(tempPassword, 12);
  const hashedPassword = await bcrypt.hash(generateTempPassword(), 12);

  // La cuenta y sus roles se crean de forma atómica: un fallo a mitad dejaría
  // un usuario sin permisos (o con solo algunos).
  const user = await sequelize.transaction(async (transaction: unknown) => {
    const created = await User.create(
      {
        firstName: employee.firstName,
        lastName: employee.lastName,
        username,
        email,
        password: hashedPassword,
        temporalPassword: hashedTemporal,
        isActive: true,
        employeeId: employee.id,
      },
      { transaction },
    );

    // Sin esto la cuenta nacía sin permisos (no podía ver ni Tareas/Perfil).
    await Promise.all(roles.map((role) => assignRole(created.id, role.id, transaction)));
    return created;
  });

  await createNotification(user.id, {
    source: `account-created:${user.id}`,
    title: "Bienvenido a Choferes",
    message: `Tu cuenta de acceso fue creada (usuario: ${user.username}). Usa la contraseña temporal para iniciar sesión.`,
    type: "success",
    category: "system",
    priority: "high",
    actionUrl: "/my-panel",
    actionText: "Ir a mi panel",
  });

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
  /**
   * Estado de la cuenta, no del empleado: es lo único que además de
   * authenticateUser bloquea el login (ver userService.authenticateUser).
   * `false` cuando no hay cuenta, porque sin cuenta no se puede entrar.
   */
  isActive: boolean;
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
    attributes: ["id", "username", "isActive"],
    include: [ROLES_INCLUDE],
  });

  if (!user) {
    return {
      hasUser: false,
      userId: null,
      username: null,
      isActive: false,
      roles: [],
      needsRole: false,
    };
  }

  const roles = (user.roles ?? []).map((role) => ({ id: role.id, name: role.name }));
  return {
    hasUser: true,
    userId: user.id,
    username: user.username,
    isActive: user.isActive,
    roles,
    needsRole: roles.length === 0,
  };
};

// Asigna a la cuenta del empleado el rol de su puesto cuando quedó sin ninguno.
// Idempotente: si ya tiene rol no cambia nada.
export const assignDefaultRoleToEmployeeUser = async (
  employeeId: number,
): Promise<EmployeeAccess> => {
  const employee = await Employee.findByPk(employeeId, {
    attributes: ["id", "position", "positions"],
  });
  if (!employee) throw new ServiceError(404, "Empleado no encontrado");

  const user = await User.findOne({ where: { employeeId: employee.id }, attributes: ["id"] });
  if (!user) {
    throw new ServiceError(400, "El empleado no tiene una cuenta de acceso al sistema");
  }

  const positions = getEmployeePositions(employee);
  await assignPositionRoleIfMissing(user.id, positions);
  const roles = await resolveRolesForPositions(positions);
  await notifyAccountRoleChange(user.id, {
    action: `se le asignó ${roles.length === 1 ? "el rol" : "los roles"} ${roles.map((role) => role.name).join(", ")}, según ${positions.length === 1 ? "su puesto" : "sus puestos"} (${getEmployeePositionsLabel(employee, null)})`,
  });
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
  // Local calendar day in Costa Rica: the scheduler may run when UTC is already
  // the next day, and an ISO slice would terminate employees one day early.
  const today = localDateString();
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
  await Promise.all(
    due.map((employee) =>
      notifyEmployeeUser(employee.id, {
        source: `employee-terminated:${employee.id}`,
        title: "Fin de contrato",
        message: `Tu contrato terminó el ${String(employee.scheduledTerminationDate).split("-").reverse().join("/")} (${employee.scheduledTerminationReason ?? "fin de contrato"}).`,
        type: "warning",
        category: "employee",
        priority: "high",
        actionUrl: "/my-panel",
        actionText: "Ver mi panel",
      }),
    ),
  );
  await notifyManagementRoles({
    source: `terminations-processed:${today}`,
    title: "Finalizaciones procesadas",
    message: `Se procesaron ${due.length} finalización(es) programada(s) hoy.`,
    type: "warning",
    category: "employee",
    priority: "high",
    actionUrl: "/employees",
    actionText: "Ver empleados",
  });
  return due.length;
};
