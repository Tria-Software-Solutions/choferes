// Llamadas de atención / amonestaciones: CRUD con adjuntos (data URLs base64).
import DisciplinaryAction from "../models/DisciplinaryAction";
import Employee from "../models/Employee";
import User from "../models/User";
import { ServiceError } from "../utils/errors";
import { paginate, getPaginationParams, QueryParams } from "../utils/pagination";

export interface DisciplinaryAttachmentInput {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

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
  return getDisciplinaryActionById(id);
};

export const deleteDisciplinaryAction = async (id: number) =>
  DisciplinaryAction.destroy({ where: { id } });
