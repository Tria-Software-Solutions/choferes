// Llamadas de atención / amonestaciones: CRUD con adjuntos (data URLs base64).
import DisciplinaryAction from "../models/DisciplinaryAction";
import Employee from "../models/Employee";
import User from "../models/User";
import { ServiceError } from "../utils/errors";
import { paginate, getPaginationParams, QueryParams } from "../utils/pagination";
import { notifyEmployeeUser, NotificationType, NotificationPriority } from "./notificationService";

export interface DisciplinaryAttachmentInput {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB per file (matches frontend)

const validateAttachments = (attachments: DisciplinaryAttachmentInput[] | undefined): void => {
  if (!attachments || attachments.length === 0) return;
  attachments.forEach((a) => {
    if (typeof a.size === "number" && a.size > MAX_ATTACHMENT_BYTES) {
      throw new ServiceError(400, `El archivo "${a.name}" supera el máximo de 10MB`);
    }
  });
};

const employeeInclude = {
  model: Employee,
  as: "employee",
  attributes: ["id", "firstName", "lastName", "email", "avatar"],
};

const userInclude = {
  model: User,
  as: "createdByUser",
  attributes: ["id", "firstName", "lastName"],
};

const normalize = (action: any) => {
  const plain =
    typeof action.get === "function"
      ? (action.get({ plain: true }) as Record<string, any>)
      : { ...action };
  return { ...plain, attachments: Array.isArray(plain.attachments) ? plain.attachments : [] };
};

export const getDisciplinaryActions = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const where: Record<string, any> = {};
  if (query.employeeId) where.employeeId = parseInt(query.employeeId, 10);

  const result = await paginate<DisciplinaryAction>(
    DisciplinaryAction,
    {
      where,
      include: [employeeInclude, userInclude],
      order: [
        ["actionDate", "DESC"],
        ["id", "DESC"],
      ],
    },
    params,
  );

  return { ...result, data: result.data.map(normalize) };
};

export const getDisciplinaryActionById = async (id: number) => {
  const action = await DisciplinaryAction.findByPk(id, {
    include: [employeeInclude, userInclude],
  });
  return action ? normalize(action) : null;
};

export interface CreateDisciplinaryInput {
  employeeId: number;
  actionDate: string;
  type: string;
  severity?: string;
  reason: string;
  description?: string | null;
  attachments?: DisciplinaryAttachmentInput[];
  createdBy?: number | null;
}

export const createDisciplinaryAction = async (input: CreateDisciplinaryInput) => {
  validateAttachments(input.attachments);

  const employee = await Employee.findByPk(input.employeeId);
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  const created = await DisciplinaryAction.create({
    employeeId: input.employeeId,
    actionDate: input.actionDate,
    type: input.type,
    severity: input.severity || "leve",
    reason: input.reason,
    description: input.description || null,
    attachments: input.attachments ?? [],
    createdBy: input.createdBy ?? null,
  } as any);

  await notifyEmployeeUser(input.employeeId, {
    source: `disciplinary-created:${created.id}`,
    title: "Nueva amonestación registrada",
    message: `Se registró una ${input.type.toLowerCase()} en tu expediente (${formatActionDate(input.actionDate)}): ${input.reason}`,
    ...severityNotification(created.severity as string),
    category: "employee",
    actionUrl: "/my-panel?tab=disciplinary",
    actionText: "Ver mi expediente",
  });

  return getDisciplinaryActionById(created.id);
};

export interface UpdateDisciplinaryInput {
  actionDate?: string;
  type?: string;
  severity?: string;
  reason?: string;
  description?: string | null;
  attachments?: DisciplinaryAttachmentInput[];
}

export const updateDisciplinaryAction = async (id: number, input: UpdateDisciplinaryInput) => {
  validateAttachments(input.attachments);

  const action = await DisciplinaryAction.findByPk(id);
  if (!action) return null;

  const updates: Record<string, unknown> = {};
  if (input.actionDate !== undefined) updates.actionDate = input.actionDate;
  if (input.type !== undefined) updates.type = input.type;
  if (input.severity !== undefined) updates.severity = input.severity;
  if (input.reason !== undefined) updates.reason = input.reason;
  if (input.description !== undefined) updates.description = input.description || null;
  if (input.attachments !== undefined) updates.attachments = input.attachments;

  if (Object.keys(updates).length > 0) {
    await action.update(updates);
  }

  const relevantChange =
    input.severity !== undefined ||
    input.type !== undefined ||
    input.reason !== undefined ||
    input.description !== undefined;
  if (relevantChange && action.employeeId) {
    await notifyEmployeeUser(action.employeeId, {
      source: `disciplinary-updated:${id}:${Date.now()}`,
      title: "Amonestación actualizada",
      message: `Se actualizó una ${(input.type ?? action.type).toLowerCase()} en tu expediente (${formatActionDate(String(action.actionDate))}).`,
      type: "warning",
      category: "employee",
      priority: "medium",
      actionUrl: "/my-panel?tab=disciplinary",
      actionText: "Ver mi expediente",
    });
  }

  return getDisciplinaryActionById(id);
};

export const deleteDisciplinaryAction = async (id: number) => {
  const action = await DisciplinaryAction.findByPk(id);
  if (!action) return false;
  await DisciplinaryAction.destroy({ where: { id } });
  if (action.employeeId) {
    await notifyEmployeeUser(action.employeeId, {
      source: `disciplinary-deleted:${id}`,
      title: "Amonestación eliminada",
      message: "Se eliminó una amonestación de tu expediente.",
      type: "info",
      category: "employee",
      priority: "low",
      actionUrl: "/my-panel?tab=disciplinary",
      actionText: "Ver mi expediente",
    });
  }
  return true;
};

const SEVERITY_NOTIFICATION: Record<
  string,
  { type: NotificationType; priority: NotificationPriority }
> = {
  grave: { type: "error", priority: "high" },
  muy_grave: { type: "error", priority: "high" },
  leve: { type: "warning", priority: "medium" },
};

const severityNotification = (severity: string) =>
  SEVERITY_NOTIFICATION[severity] ?? {
    type: "warning",
    priority: "medium" as NotificationPriority,
  };

const formatActionDate = (date: string) => {
  const [year, month, day] = String(date).split("-");
  return `${day}/${month}/${year}`;
};
