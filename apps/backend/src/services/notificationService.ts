// Service for business logic and database operations related to notifications
import { getCurrentActorId } from "../utils/actorContext";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { UserRole } from "../models/UserRole";
import { Role } from "../models/Role";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationCategory =
  "employee" | "schedule" | "vehicle" | "system" | "report" | "task";
export type NotificationPriority = "low" | "medium" | "high";

interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  source?: string;
}

// Notification preference (Perfil → Notificaciones) each kind of notification
// belongs to, derived from the start of its `source` key. Sources that match
// nothing (manual or system notifications) are always delivered.
const SETTING_BY_SOURCE_PREFIX: ReadonlyArray<[RegExp, string]> = [
  [/^vacation-/, "vacations"],
  [/^boletas?-/, "boletas"],
  [/^payment-/, "payments"],
  [/^license-/, "licenses"],
  [/^disciplinary-/, "disciplines"],
  [/^(employee-|terminations-)/, "employees"],
  [/^(schedule-)/, "schedules"],
  [/^vehicle-/, "vehicles"],
  [/^(account-|user-|password-|temp-password-)/, "users"],
  [/^role-/, "roles"],
  [/^task-/, "tasks"],
];

export const settingKeyForSource = (source?: string): string | null => {
  if (!source) return null;
  const match = SETTING_BY_SOURCE_PREFIX.find(([pattern]) => pattern.test(source));
  return match ? match[1] : null;
};

// Roles that receive the management notifications (requests to approve, audit
// events, account and role changes).
const NOTIFIED_ROLE_NAMES = ["Gerencia", "Administrativo"];

// Delivers a notification to every user with the Gerencia or Administrativo
// role. Used by the business flows so a request raised by an employee reaches
// the people who approve it.
export const notifyManagementRoles = async (data: CreateNotificationData) => {
  const managementRoles = await Role.findAll({
    where: { name: NOTIFIED_ROLE_NAMES },
    attributes: ["id"],
  });
  const managementRoleIds = managementRoles.map((role) => role.id);
  if (managementRoleIds.length === 0) return;

  const assignments = await UserRole.findAll({
    where: { roleId: managementRoleIds },
    attributes: ["userId"],
  });

  const targetIds = [...new Set(assignments.map((assignment) => assignment.userId))];
  await Promise.all(targetIds.map((userId) => createNotification(userId, data)));
};

// Tells Gerencia/Administrativo that an account's role changed. The affected
// person is not notified: role changes are handled by management.
export const notifyAccountRoleChange = async (
  userId: number,
  data: { action: string; type?: NotificationType; priority?: NotificationPriority },
) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "firstName", "lastName", "username"],
  });
  const name = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username
    : `la cuenta #${userId}`;
  await notifyManagementRoles({
    source: `role-account:${userId}:${Date.now()}`,
    title: "Rol de una cuenta modificado",
    message: `${name}: ${data.action}.`,
    type: data.type ?? "info",
    category: "system",
    priority: data.priority ?? "medium",
    actionUrl: "/settings?tab=users",
    actionText: "Ver usuarios",
  });
};

// Delivers a notification to the user linked to an employee (by employeeId),
// returning true when such an account exists.
export const notifyEmployeeUser = async (
  employeeId: number,
  data: CreateNotificationData,
): Promise<boolean> => {
  const user = await User.findOne({ where: { employeeId } });
  if (!user) return false;
  await createNotification(user.id, data);
  return true;
};

const ATTRIBUTES = [
  "id",
  "userId",
  "title",
  "message",
  "type",
  "category",
  "priority",
  "read",
  "actionUrl",
  "actionText",
  "source",
  "createdAt",
  "updatedAt",
];

// Get all notifications for a user (newest first), removing any older than 30 days
export const getNotificationsByUser = async (userId: number) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await Notification.destroy({
    where: {
      userId,
      createdAt: { $lt: thirtyDaysAgo },
    },
  });

  return Notification.findAll({
    where: { userId },
    attributes: ATTRIBUTES,
    order: [["createdAt", "DESC"]],
  });
};

// Create a new notification for a user. Idempotent by design: the (userId,
// source) pair is unique, and some flows notify both the employee and the
// management roles using the same source (e.g. a user who is an employee and
// also Gerencia). A duplicate insert is a no-op instead of an error, and
// re-running an idempotent job never spawns a second notification.
export const createNotification = async (userId: number, data: CreateNotificationData) => {
  // Whoever performed the action already knows about it: don't notify them.
  if (getCurrentActorId() === userId) return null;

  // Respect the recipient's preferences: a kind they switched off is not delivered.
  const settingKey = settingKeyForSource(data.source);
  if (settingKey) {
    const recipient = await User.findByPk(userId, { attributes: ["id", "settings"] });
    const prefs = (recipient?.settings as Record<string, any> | undefined)?.notifications;
    if (prefs?.[settingKey] === false) return null;
  }
  try {
    const notification = await Notification.create({ ...data, userId });
    await notification.reload();
    return notification;
  } catch (error) {
    if ((error as { name?: string }).name === "SequelizeUniqueConstraintError") {
      return null;
    }
    throw error;
  }
};

// Mark a single notification as read. Scoped by owner on both the update and
// the read-back so a user can never fetch someone else's notification by id.
export const markAsRead = async (userId: number, id: number) => {
  await Notification.update({ read: true }, { where: { id, userId } });
  return Notification.findOne({ where: { id, userId }, attributes: ATTRIBUTES });
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId: number) => {
  await Notification.update({ read: true }, { where: { userId } });
};

// Delete a single notification
export const deleteNotification = async (userId: number, id: number) =>
  Notification.destroy({ where: { id, userId } });

// Delete all notifications for a user
export const deleteAllNotifications = async (userId: number) =>
  Notification.destroy({ where: { userId } });

// Generate payment reminders for the 15th and last day of each month (idempotent by source)
// Accepts an optional "today" date (YYYY-MM-DD) from the client so the reminder is
// computed in the user's local timezone instead of the server's.
export const generatePaymentReminders = async (userId: number, today?: string) => {
  const now = today ? new Date(`${today}T12:00:00`) : new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const monthName = MONTH_NAMES[month];

  // Respect the user's notification settings (default: enabled)
  const user = await User.findByPk(userId, { include: [{ model: Role, as: "roles" }] });

  // Only Gerencia / Administrativo pay the quincena: drivers and other roles
  // must not receive the reminder (the client asks for it on every login).
  const roleNames = ((user as unknown as { roles?: Array<{ name: string }> })?.roles ?? []).map(
    (role) => role.name,
  );
  if (!roleNames.some((name) => NOTIFIED_ROLE_NAMES.includes(name))) return [];

  const notifSettings =
    ((user?.settings as Record<string, unknown> | undefined)?.notifications as
      Record<string, unknown> | undefined) ?? {};
  const paymentsEnabled = notifSettings.payments !== false;

  // Last day of the current month (28/29/30/31 depending on month and leap year)
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  const reminders: CreateNotificationData[] = [];

  if (paymentsEnabled && day === 15) {
    reminders.push({
      source: `payment-1:${year}-${month + 1}`,
      title: "Pago de Quincena 1",
      message: `Hoy es 15 de ${monthName}. Revisa las horas de la primera quincena y realiza los pagos a los choferes.`,
      type: "warning",
      category: "report",
      priority: "high",
      actionUrl: "/employees",
      actionText: "Ver boletas",
    });
  }

  if (paymentsEnabled && day === lastDayOfMonth) {
    reminders.push({
      source: `payment-2:${year}-${month + 1}`,
      title: "Pago de Quincena 2",
      message: `Hoy cierra el mes. Revisa las horas de la segunda quincena y realiza los pagos antes de terminar el día.`,
      type: "warning",
      category: "report",
      priority: "high",
      actionUrl: "/employees",
      actionText: "Ver boletas",
    });
  }

  const results = await Promise.all(
    reminders.map(async (reminder) => {
      const existing = await Notification.findOne({
        where: { userId, source: reminder.source },
      });
      if (existing) {
        return null;
      }
      try {
        // Unique (userId, source) index prevents duplicates even on races
        return await Notification.create({ ...reminder, userId });
      } catch (error) {
        // Only treat unique-constraint races as benign; rethrow real errors
        if ((error as { name?: string }).name !== "SequelizeUniqueConstraintError") {
          throw error;
        }
        // Another concurrent request already created this reminder
        return Notification.findOne({
          where: { userId, source: reminder.source },
        });
      }
    }),
  );
  const created: Notification[] = results.filter((n): n is Notification => n !== null);
  return created;
};

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
