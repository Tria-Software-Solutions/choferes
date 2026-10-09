// Solicitudes de cambio de licencia del empleado.
//
// El empleado no escribe `employee_licenses` directamente desde su expediente:
// deja una solicitud aquí y Gerencia/Administrativo la aprueba (aplicando el
// cambio a la licencia real) o la rechaza. Así el expediente no pierde
// autoridad sobre un dato oficial como la licencia de conducir, pero el
// empleado no depende de que alguien recuerde actualizarlo.
import LicenseRequest, {
  LicenseRequestAction,
  LicenseRequestStatus,
} from "../models/LicenseRequest";
import sequelize from "../config/database";
import EmployeeLicense from "../models/EmployeeLicense";
import Employee from "../models/Employee";
import { ServiceError } from "../utils/errors";
import { notifyEmployeeUser, notifyManagementRoles } from "./notificationService";
import * as licenseService from "./employeeLicenseService";

export const LICENSE_REQUEST_ACTIONS: readonly LicenseRequestAction[] = [
  "create",
  "update",
  "delete",
];

export const LICENSE_REQUEST_STATUSES: readonly LicenseRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
];

/** Campos que el empleado puede proponer sobre una licencia. */
export interface LicenseRequestPayload {
  licenseType?: string;
  licenseNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}

export interface CreateLicenseRequestInput extends LicenseRequestPayload {
  action: LicenseRequestAction;
  /** Obligatorio para editar o eliminar; se ignora al crear. */
  licenseId?: number | null;
}

const PAYLOAD_FIELDS = ["licenseType", "licenseNumber", "issuedAt", "expiresAt", "notes"] as const;

const employeeInclude = {
  model: Employee,
  as: "employee",
  attributes: ["id", "firstName", "lastName"],
};

const licenseInclude = {
  model: EmployeeLicense,
  as: "license",
  attributes: ["id", "licenseType", "licenseNumber", "issuedAt", "expiresAt", "notes"],
};

const employeeNameOf = (employee?: Employee | null, fallbackId?: number): string => {
  const name = employee ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() : "";
  return name || `el empleado #${fallbackId ?? "?"}`;
};

// El payload guarda solo los campos enviados, para que al aprobar se apliquen
// exactamente los cambios propuestos y no se borre lo que el empleado no tocó.
const pickPayload = (input: LicenseRequestPayload): Record<string, unknown> =>
  Object.fromEntries(
    PAYLOAD_FIELDS.filter((field) => input[field] !== undefined).map((field) => [
      field,
      input[field],
    ]),
  );

// Sequelize 4 no declara `get()` en el tipo de instancia, así que se castea.
type PlainRow = { get: (options: { plain: true }) => Record<string, any> };
const serialize = (request: LicenseRequest): Record<string, any> =>
  (request as unknown as PlainRow).get({ plain: true });

/**
 * Registra una solicitud del propio empleado. Los cambios de una licencia que
 * no es suya se rechazan, y no se permite acumular dos solicitudes pendientes
 * sobre la misma licencia (la última reemplaza a la anterior).
 */
export const createRequest = async (employeeId: number, input: CreateLicenseRequestInput) => {
  if (!LICENSE_REQUEST_ACTIONS.includes(input.action)) {
    throw new ServiceError(400, "Acción de licencia inválida");
  }

  const employee = await Employee.findByPk(employeeId, {
    attributes: ["id", "firstName", "lastName"],
  });
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  let licenseId: number | null = null;

  if (input.action === "create") {
    licenseId = null;
  } else {
    const targetId = Number(input.licenseId);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      throw new ServiceError(400, "La solicitud necesita la licencia a modificar");
    }
    const license = await EmployeeLicense.findByPk(targetId, {
      attributes: ["id", "employeeId", "licenseType"],
    });
    if (!license) {
      throw new ServiceError(404, "Licencia no encontrada");
    }
    if (license.employeeId !== employeeId) {
      throw new ServiceError(403, "Esa licencia no pertenece a tu expediente");
    }
    licenseId = license.id;

    // Una sola solicitud pendiente por licencia: el empleado puede corregirla
    // sin que se acumulen revisiones contradictorias.
    await LicenseRequest.destroy({ where: { licenseId, status: "pending" } });
  }

  // Al crear se exige la categoría; al editar cualquier campo suelto sirve.
  if (input.action === "create" && !input.licenseType) {
    throw new ServiceError(400, "La categoría de licencia es obligatoria");
  }

  const request = await LicenseRequest.create({
    employeeId,
    licenseId,
    action: input.action,
    payload: input.action === "delete" ? null : pickPayload(input),
    status: "pending",
  });

  const ACTION_LABELS: Record<LicenseRequestAction, string> = {
    create: "crear",
    update: "editar",
    delete: "eliminar",
  };
  const actionLabel = ACTION_LABELS[input.action];
  const typeLabel = input.licenseType ?? "una licencia";
  await notifyManagementRoles({
    source: `license-request:${request.id}`,
    title: "Solicitud de cambio de licencia",
    message: `${employeeNameOf(employee)} pidió ${actionLabel} su licencia ${typeLabel}. Revísala en su expediente.`,
    type: "info",
    category: "employee",
    priority: "medium",
    actionUrl: `/employees/${employeeId}?tab=licenses`,
    actionText: "Revisar solicitud",
  });

  return serialize(request);
};

/** Solicitudes de un empleado, más recientes primero. */
export const listByEmployee = async (employeeId: number, status?: LicenseRequestStatus) => {
  const where: Record<string, unknown> = { employeeId };
  if (status) where.status = status;
  const rows = await LicenseRequest.findAll({
    where,
    include: [licenseInclude],
    order: [["createdAt", "DESC"]],
  });
  return rows.map(serialize);
};

/** Listado para revisión: filtrable por empleado y estado. */
export const listRequests = async (query: Record<string, string | undefined>) => {
  const where: Record<string, unknown> = {};
  if (query.employeeId) {
    const employeeId = parseInt(query.employeeId, 10);
    if (Number.isInteger(employeeId)) where.employeeId = employeeId;
  }
  if (query.status && LICENSE_REQUEST_STATUSES.includes(query.status as LicenseRequestStatus)) {
    where.status = query.status;
  }

  const rows = await LicenseRequest.findAll({
    where,
    include: [employeeInclude, licenseInclude],
    order: [["createdAt", "DESC"]],
    limit: 200,
  });
  return rows.map(serialize);
};

/** Aplica la solicitud aprobada a la licencia real. */
const applyRequest = async (request: LicenseRequest, transaction?: unknown) => {
  const payload = (request.payload ?? {}) as LicenseRequestPayload;

  if (request.action === "create") {
    await licenseService.createLicense(
      {
        employeeId: request.employeeId,
        licenseType: String(payload.licenseType),
        licenseNumber: payload.licenseNumber ?? null,
        issuedAt: payload.issuedAt ?? null,
        expiresAt: payload.expiresAt ?? null,
        notes: payload.notes ?? null,
      },
      { transaction },
    );
    return;
  }

  const licenseId = Number(request.licenseId);
  if (!Number.isInteger(licenseId) || licenseId <= 0) {
    throw new ServiceError(409, "La licencia de la solicitud ya no existe");
  }

  if (request.action === "update") {
    const updated = await licenseService.updateLicense(licenseId, payload, { transaction });
    if (!updated) throw new ServiceError(409, "La licencia de la solicitud ya no existe");
    return;
  }

  if (request.action === "delete") {
    const deleted = await licenseService.deleteLicense(licenseId, { transaction });
    if (!deleted) throw new ServiceError(409, "La licencia de la solicitud ya no existe");
  }
};

const findPending = async (id: number) => {
  const request = await LicenseRequest.findByPk(id);
  if (!request) throw new ServiceError(404, "Solicitud no encontrada");
  if (request.status !== "pending") {
    throw new ServiceError(409, "Esa solicitud ya fue revisada");
  }
  return request;
};

/** Aprueba la solicitud y aplica el cambio sobre las licencias del empleado. */
export const approveRequest = async (id: number, reviewerUserId: number) => {
  const request = await findPending(id);

  // Applying the license change and closing the request must be atomic: on
  // "create" a partial failure would leave a license with the request still
  // pending, and a retry would insert the license twice.
  await sequelize.transaction(async (transaction: unknown) => {
    await applyRequest(request, transaction);
    await request.update(
      {
        status: "approved",
        reviewedBy: reviewerUserId,
        reviewedAt: new Date(),
      },
      { transaction },
    );
  });

  await notifyEmployeeUser(request.employeeId, {
    source: `license-request-approved:${request.id}`,
    title: "Solicitud de licencia aprobada",
    message: "Se aprobó el cambio que pediste en tu licencia de conducir.",
    type: "success",
    category: "employee",
    priority: "low",
    actionUrl: "/my-panel?tab=licenses",
    actionText: "Ver mi expediente",
  });

  return getRequestById(request.id);
};

/** Rechaza la solicitud (con un motivo opcional) sin tocar la licencia. */
export const rejectRequest = async (
  id: number,
  reviewerUserId: number,
  reviewNotes?: string | null,
) => {
  const request = await findPending(id);

  await request.update({
    status: "rejected",
    reviewedBy: reviewerUserId,
    reviewedAt: new Date(),
    reviewNotes: reviewNotes?.trim() || null,
  });

  await notifyEmployeeUser(request.employeeId, {
    source: `license-request-rejected:${request.id}`,
    title: "Solicitud de licencia rechazada",
    message: reviewNotes?.trim()
      ? `No se aplicó el cambio: ${reviewNotes.trim()}`
      : "No se aplicó el cambio que pediste en tu licencia de conducir.",
    type: "warning",
    category: "employee",
    priority: "low",
    actionUrl: "/my-panel?tab=licenses",
    actionText: "Ver mi expediente",
  });

  return getRequestById(request.id);
};

export const getRequestById = async (id: number) => {
  const request = await LicenseRequest.findByPk(id, {
    include: [employeeInclude, licenseInclude],
  });
  return request ? serialize(request) : null;
};
