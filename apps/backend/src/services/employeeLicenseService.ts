// Licencias de conducir de los empleados: CRUD y estado de vencimiento.
import EmployeeLicense from "../models/EmployeeLicense";
import Employee from "../models/Employee";
import { ServiceError } from "../utils/errors";
import { paginate, getPaginationParams, QueryParams } from "../utils/pagination";
import { notifyEmployeeUser, notifyManagementRoles } from "./notificationService";

// Días de anticipación con los que se considera una licencia "por vencer".
export const LICENSE_EXPIRING_SOON_DAYS = 30;

export type LicenseStatus = "vigente" | "por_vencer" | "vencida" | "sin_vencimiento";

const employeeInclude = {
  model: Employee,
  as: "employee",
  attributes: ["id", "firstName", "lastName", "email", "avatar"],
};

const parseDateOnly = (value: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    throw new ServiceError(400, `Fecha inválida: ${value} (use YYYY-MM-DD)`);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

export const daysUntilExpiry = (expiresAt?: string | null): number | null => {
  if (!expiresAt) return null;
  const expiry = parseDateOnly(String(expiresAt));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

export const statusFor = (days: number | null): LicenseStatus => {
  if (days === null) return "sin_vencimiento";
  if (days < 0) return "vencida";
  if (days <= LICENSE_EXPIRING_SOON_DAYS) return "por_vencer";
  return "vigente";
};

const formatDate = (value: string) => {
  const [year, month, day] = String(value).split("-");
  return `${day}/${month}/${year}`;
};

// Adds computed expiry fields so the UI can flag licenses without duplicating
// the date math on the client.
const normalize = (license: any) => {
  const plain =
    typeof license.get === "function"
      ? (license.get({ plain: true }) as Record<string, any>)
      : { ...license };
  const days = daysUntilExpiry(plain.expiresAt);
  return { ...plain, daysUntilExpiry: days, status: statusFor(days) };
};

export const getLicenses = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const where: Record<string, any> = {};
  if (query.employeeId) where.employeeId = parseInt(query.employeeId, 10);

  const result = await paginate<EmployeeLicense>(
    EmployeeLicense,
    {
      where,
      include: [employeeInclude],
      order: [
        ["expiresAt", "ASC"],
        ["id", "DESC"],
      ],
    },
    params,
  );

  return { ...result, data: result.data.map(normalize) };
};

export const getLicenseById = async (id: number, transaction?: unknown) => {
  const license = await EmployeeLicense.findByPk(id, { include: [employeeInclude], transaction });
  return license ? normalize(license) : null;
};

export const getLicensesByEmployee = async (employeeId: number) => {
  const rows = await EmployeeLicense.findAll({
    where: { employeeId },
    order: [
      ["expiresAt", "ASC"],
      ["id", "DESC"],
    ],
  });
  return rows.map(normalize);
};

export interface CreateLicenseInput {
  employeeId: number;
  licenseType: string;
  licenseNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}

export const createLicense = async (
  input: CreateLicenseInput,
  options: { transaction?: unknown } = {},
) => {
  const employee = await Employee.findByPk(input.employeeId, { transaction: options.transaction });
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  const created = await EmployeeLicense.create(
    {
      employeeId: input.employeeId,
      licenseType: input.licenseType,
      licenseNumber: input.licenseNumber || null,
      issuedAt: input.issuedAt || null,
      expiresAt: input.expiresAt || null,
      notes: input.notes || null,
    },
    { transaction: options.transaction },
  );

  await notifyEmployeeUser(input.employeeId, {
    source: `license-created:${created.id}`,
    title: "Licencia registrada",
    message: `Se registró tu licencia ${input.licenseType}${input.expiresAt ? ` (vence ${formatDate(input.expiresAt)})` : ""}.`,
    type: "success",
    category: "employee",
    priority: "low",
    actionUrl: "/my-panel?tab=licenses",
    actionText: "Ver mi expediente",
  });

  return normalize(created.get({ plain: true }));
};

export interface UpdateLicenseInput {
  licenseType?: string;
  licenseNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}

export const updateLicense = async (
  id: number,
  input: UpdateLicenseInput,
  options: { transaction?: unknown } = {},
) => {
  const license = await EmployeeLicense.findByPk(id, { transaction: options.transaction });
  if (!license) return null;

  const updates: Record<string, unknown> = {};
  if (input.licenseType !== undefined) updates.licenseType = input.licenseType;
  if (input.licenseNumber !== undefined) updates.licenseNumber = input.licenseNumber || null;
  if (input.issuedAt !== undefined) updates.issuedAt = input.issuedAt || null;
  if (input.expiresAt !== undefined) updates.expiresAt = input.expiresAt || null;
  if (input.notes !== undefined) updates.notes = input.notes || null;

  if (Object.keys(updates).length > 0) {
    await license.update(updates, { transaction: options.transaction });
  }

  if (Object.keys(updates).length > 0) {
    await notifyEmployeeUser(license.employeeId, {
      source: `license-updated:${id}:${Date.now()}`,
      title: "Licencia actualizada",
      message:
        input.expiresAt !== undefined && input.expiresAt
          ? `Se actualizó tu licencia ${input.licenseType ?? license.licenseType}; vence el ${formatDate(input.expiresAt)}.`
          : `Se actualizó tu licencia ${input.licenseType ?? license.licenseType}.`,
      type: "info",
      category: "employee",
      priority: "medium",
      actionUrl: "/my-panel?tab=licenses",
      actionText: "Ver mi expediente",
    });
  }

  return getLicenseById(id, options.transaction);
};

export const deleteLicense = async (id: number, options: { transaction?: unknown } = {}) => {
  const license = await EmployeeLicense.findByPk(id, { transaction: options.transaction });
  if (!license) return false;
  await EmployeeLicense.destroy({ where: { id }, transaction: options.transaction });
  await notifyEmployeeUser(license.employeeId, {
    source: `license-deleted:${id}`,
    title: "Licencia eliminada",
    message: `Se eliminó tu licencia ${license.licenseType} del expediente.`,
    type: "info",
    category: "employee",
    priority: "low",
    actionUrl: "/my-panel?tab=licenses",
    actionText: "Ver mi expediente",
  });
  return true;
};

/**
 * Dispatches expiring/expired license reminders to the linked employee and to
 * management. Runs from the daily scheduler; idempotent through the unique
 * (userId, source) index because the source embeds the expiry date.
 */
export const dispatchLicenseReminders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + LICENSE_EXPIRING_SOON_DAYS);

  const licenses = await EmployeeLicense.findAll({
    where: {
      expiresAt: { $lte: toDateOnly(horizon), $ne: null },
    },
    include: [employeeInclude],
  });

  const totalDispatched = await Promise.all(
    licenses.map(async (license) => {
      const expiresAt = String(license.expiresAt);
      const days = daysUntilExpiry(expiresAt);
      if (days === null) return 0;
      const expired = days < 0;
      const source = expired
        ? `license-expired:${license.id}:${expiresAt}`
        : `license-expiring:${license.id}:${expiresAt}`;
      const title = expired ? "Licencia vencida" : "Licencia por vencer";
      const type = expired ? "error" : "warning";
      const priority = expired ? "high" : "high";
      const rel = expired
        ? `venció el ${formatDate(expiresAt)}`
        : `vence en ${days} día(s) (${formatDate(expiresAt)})`;
      const employeeName = license.employee
        ? `${license.employee.firstName ?? ""} ${license.employee.lastName ?? ""}`.trim()
        : `#${license.employeeId}`;

      await notifyEmployeeUser(license.employeeId, {
        source,
        title,
        message: `Tu licencia ${license.licenseType} ${rel}.`,
        type,
        category: "employee",
        priority,
        actionUrl: "/my-panel?tab=licenses",
        actionText: "Ver mi expediente",
      });
      await notifyManagementRoles({
        source,
        title,
        message: `La licencia ${license.licenseType} del empleado ${employeeName} ${rel}.`,
        type,
        category: "employee",
        priority,
        actionUrl: `/employees/${license.employeeId}?tab=licenses`,
        actionText: "Ver licencia",
      });
      return 1;
    }),
  );

  return totalDispatched.reduce<number>((sum, n) => sum + n, 0);
};

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};
