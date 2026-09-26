// Licencias de conducir de los empleados: CRUD y estado de vencimiento.
import EmployeeLicense from "../models/EmployeeLicense";
import Employee from "../models/Employee";
import { ServiceError } from "../utils/errors";
import { paginate, getPaginationParams, QueryParams } from "../utils/pagination";

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

const daysUntilExpiry = (expiresAt?: string | null): number | null => {
  if (!expiresAt) return null;
  const expiry = parseDateOnly(String(expiresAt));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

const statusFor = (days: number | null): LicenseStatus => {
  if (days === null) return "sin_vencimiento";
  if (days < 0) return "vencida";
  if (days <= LICENSE_EXPIRING_SOON_DAYS) return "por_vencer";
  return "vigente";
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

export const getLicenseById = async (id: number) => {
  const license = await EmployeeLicense.findByPk(id, { include: [employeeInclude] });
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

export const createLicense = async (input: CreateLicenseInput) => {
  const employee = await Employee.findByPk(input.employeeId);
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  const created = await EmployeeLicense.create({
    employeeId: input.employeeId,
    licenseType: input.licenseType,
    licenseNumber: input.licenseNumber || null,
    issuedAt: input.issuedAt || null,
    expiresAt: input.expiresAt || null,
    notes: input.notes || null,
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

export const updateLicense = async (id: number, input: UpdateLicenseInput) => {
  const license = await EmployeeLicense.findByPk(id);
  if (!license) return null;

  const updates: Record<string, unknown> = {};
  if (input.licenseType !== undefined) updates.licenseType = input.licenseType;
  if (input.licenseNumber !== undefined) updates.licenseNumber = input.licenseNumber || null;
  if (input.issuedAt !== undefined) updates.issuedAt = input.issuedAt || null;
  if (input.expiresAt !== undefined) updates.expiresAt = input.expiresAt || null;
  if (input.notes !== undefined) updates.notes = input.notes || null;

  if (Object.keys(updates).length > 0) {
    await license.update(updates);
  }
  return getLicenseById(id);
};

export const deleteLicense = async (id: number) => EmployeeLicense.destroy({ where: { id } });
