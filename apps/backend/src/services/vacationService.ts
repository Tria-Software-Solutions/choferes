// Service for vacation requests: CRUD plus approve/reject with balance handling.
import Vacation from "../models/Vacation";
import Employee from "../models/Employee";
import User from "../models/User";
import { ServiceError } from "../utils/errors";
import { paginate, getPaginationParams, QueryParams } from "../utils/pagination";
import { notifyEmployeeUser, notifyManagementRoles } from "./notificationService";

const employeeInclude = {
  model: Employee,
  as: "employee",
  attributes: ["id", "firstName", "lastName", "email", "avatar", "vacationDays"],
};

const approverInclude = {
  model: User,
  as: "approvedByUser",
  attributes: ["id", "firstName", "lastName"],
};

// Parses a YYYY-MM-DD string as a local calendar date.
const parseISODate = (value: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new ServiceError(400, `Fecha inválida: ${value} (use YYYY-MM-DD)`);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

// Vacation days are business days (Mon-Fri) between startDate and endDate
// inclusive — weekends are not deducted from the balance.
export const countBusinessDays = (startDate: string, endDate: string): number => {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ServiceError(400, "Fecha inválida");
  }
  if (end.getTime() < start.getTime()) {
    throw new ServiceError(400, "La fecha final no puede ser anterior a la inicial");
  }
  if (end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) {
    throw new ServiceError(400, "El rango de vacaciones no puede exceder un año");
  }

  let days = 0;
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  if (days === 0) {
    throw new ServiceError(400, "El rango no incluye ningún día hábil");
  }
  return days;
};

const formatDate = (value: string) => {
  const [year, month, day] = String(value).split("-");
  return `${day}/${month}/${year}`;
};

const normalize = <T extends Record<string, any>>(vacation: T) => {
  const plain =
    typeof vacation.get === "function"
      ? (vacation.get({ plain: true }) as Record<string, any>)
      : { ...vacation };
  if (plain.employee && plain.employee.vacationDays != null) {
    plain.employee.vacationDays = Number(plain.employee.vacationDays);
  }
  return plain;
};

// Fetches vacations (paginated) with employee + approver identity.
export const getVacations = async (query: QueryParams) => {
  const params = getPaginationParams(query);

  const where: Record<string, any> = {};
  if (query.employeeId) where.employeeId = parseInt(query.employeeId, 10);
  if (query.status) where.status = query.status;

  const result = await paginate<Vacation>(
    Vacation,
    {
      where,
      include: [employeeInclude, approverInclude],
      order: [
        ["startDate", "DESC"],
        ["id", "DESC"],
      ],
    },
    params,
  );

  return { ...result, data: result.data.map(normalize) };
};

// Fetches a single vacation with employee + approver.
export const getVacationById = async (id: number) => {
  const vacation = await Vacation.findByPk(id, {
    include: [employeeInclude, approverInclude],
  });
  return vacation ? normalize(vacation) : null;
};

export interface CreateVacationInput {
  employeeId: number;
  startDate: string;
  endDate: string;
  reason?: string | null;
}

// Creates a pending vacation request; days are always computed server-side.
export const createVacation = async (input: CreateVacationInput) => {
  const employee = await Employee.findByPk(input.employeeId);
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  const daysRequested = countBusinessDays(input.startDate, input.endDate);

  const created = await Vacation.create({
    employeeId: input.employeeId,
    startDate: input.startDate,
    endDate: input.endDate,
    daysRequested,
    status: "pending",
    reason: input.reason || null,
  });

  const employeeName = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  await notifyManagementRoles({
    source: `vacation-request:${created.id}`,
    title: "Solicitud de vacaciones",
    message: `${employeeName} solicitó ${daysRequested} día(s) de vacaciones (del ${formatDate(input.startDate)} al ${formatDate(input.endDate)}).`,
    type: "info",
    category: "employee",
    priority: "medium",
    actionUrl: "/dashboard",
    actionText: "Ver solicitudes",
  });

  return normalize(created.get({ plain: true }));
};

export interface UpdateVacationInput {
  startDate?: string;
  endDate?: string;
  reason?: string | null;
  status?: "pending" | "approved" | "rejected";
  // Id of the authenticated user making the decision (set by the controller).
  approvedBy?: number;
}

// Updates a vacation. Field edits are only allowed while the request is
// pending; changing the status approves/rejects it and moves the balance:
//  - approve → deduct days (fails if the balance is insufficient)
//  - reject an approved request → restore the days
//  - reject a pending request → no balance change
export const updateVacation = async (id: number, input: UpdateVacationInput) => {
  const vacation = await Vacation.findByPk(id);
  if (!vacation) return null;

  const employee = await Employee.findByPk(vacation.employeeId);
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  const previousStatus = vacation.status;
  const updates: Record<string, unknown> = {};

  // Field edits (dates/reason) only while pending.
  if (input.startDate !== undefined || input.endDate !== undefined) {
    if (previousStatus !== "pending") {
      throw new ServiceError(400, "Solo se pueden editar las fechas de una solicitud pendiente");
    }
    const startDate = input.startDate ?? vacation.startDate;
    const endDate = input.endDate ?? vacation.endDate;
    updates.startDate = startDate;
    updates.endDate = endDate;
    updates.daysRequested = countBusinessDays(startDate, endDate);
  }
  if (input.reason !== undefined) {
    updates.reason = input.reason;
  }

  if (input.status !== undefined && input.status !== previousStatus) {
    if (input.status === "approved") {
      if (previousStatus === "approved") {
        throw new ServiceError(400, "La solicitud ya está aprobada");
      }
      const balance = employee.vacationDays;
      if (balance != null && Number(balance) < vacation.daysRequested) {
        throw new ServiceError(
          400,
          `Saldo de vacaciones insuficiente: ${balance} días disponibles, se requieren ${vacation.daysRequested}`,
        );
      }
      if (balance != null) {
        await employee.update({ vacationDays: Number(balance) - vacation.daysRequested });
      }
      updates.status = "approved";
      updates.approvedBy = input.approvedBy ?? null;
      updates.approvedAt = new Date();
    } else if (input.status === "rejected") {
      if (previousStatus === "approved") {
        // Restore the balance deducted on approval.
        const balance = employee.vacationDays;
        if (balance != null) {
          await employee.update({ vacationDays: Number(balance) + vacation.daysRequested });
        }
      }
      updates.status = "rejected";
      updates.approvedBy = input.approvedBy ?? vacation.approvedBy ?? null;
      updates.approvedAt = null;
    } else if (input.status === "pending") {
      if (previousStatus === "approved") {
        const balance = employee.vacationDays;
        if (balance != null) {
          await employee.update({ vacationDays: Number(balance) + vacation.daysRequested });
        }
      }
      updates.status = "pending";
      updates.approvedBy = null;
      updates.approvedAt = null;
    }
  }

  if (Object.keys(updates).length > 0) {
    await vacation.update(updates);
  }

  // Notify the employee once a request is approved or rejected so the flow is
  // bidirectional: they asked, management decided, they get the answer.
  const statusChanged =
    input.status !== undefined &&
    input.status !== previousStatus &&
    (input.status === "approved" || input.status === "rejected");
  if (statusChanged) {
    const decidedStatus = input.status === "approved" ? "aprobadas" : "rechazadas";
    await notifyEmployeeUser(vacation.employeeId, {
      source: `vacation-decision:${vacation.id}`,
      title: `Vacaciones ${decidedStatus}`,
      message: `Tu solicitud de vacaciones (del ${vacation.startDate} al ${vacation.endDate}) fue ${input.status === "approved" ? "aprobada" : "rechazada"}.`,
      type: input.status === "approved" ? "success" : "error",
      category: "employee",
      priority: input.status === "approved" ? "low" : "high",
      actionUrl: "/dashboard",
      actionText: "Ver estado",
    });
  }

  if (input.status === "pending" && previousStatus === "approved") {
    await notifyEmployeeUser(vacation.employeeId, {
      source: `vacation-unapproved:${vacation.id}:${Date.now()}`,
      title: "Solicitud devuelta a pendiente",
      message: `Tu solicitud de vacaciones (del ${vacation.startDate} al ${vacation.endDate}) volvió a estado pendiente.`,
      type: "warning",
      category: "employee",
      priority: "medium",
      actionUrl: "/dashboard",
      actionText: "Ver estado",
    });
  }

  if (input.startDate !== undefined || input.endDate !== undefined) {
    await notifyEmployeeUser(vacation.employeeId, {
      source: `vacation-updated:${vacation.id}:${Date.now()}`,
      title: "Solicitud de vacaciones actualizada",
      message: `Se ajustaron las fechas de tu solicitud de vacaciones (del ${updates.startDate ?? vacation.startDate} al ${updates.endDate ?? vacation.endDate}).`,
      type: "info",
      category: "employee",
      priority: "medium",
      actionUrl: "/dashboard",
      actionText: "Ver estado",
    });
  }

  return getVacationById(id);
};

// Deletes a vacation; an approved one returns its days to the balance.
export const deleteVacation = async (id: number) => {
  const vacation = await Vacation.findByPk(id);
  if (!vacation) return false;

  if (vacation.status === "approved") {
    const employee = await Employee.findByPk(vacation.employeeId);
    if (employee && employee.vacationDays != null) {
      await employee.update({
        vacationDays: Number(employee.vacationDays) + vacation.daysRequested,
      });
    }
  }

  await notifyEmployeeUser(vacation.employeeId, {
    source: `vacation-cancelled:${vacation.id}`,
    title: "Solicitud de vacaciones cancelada",
    message: `Tu solicitud de vacaciones (del ${vacation.startDate} al ${vacation.endDate}) fue eliminada.`,
    type: "info",
    category: "employee",
    priority: "medium",
    actionUrl: "/dashboard",
    actionText: "Ver estado",
  });

  await vacation.destroy();
  return true;
};
