// Mock Notification model - Notification is both a named AND default export
// The service uses: import { Notification } from "../models/Notification" (named import)
jest.mock("../models/Notification", () => {
  const mockFunctions = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  return {
    __esModule: true,
    Notification: mockFunctions,
    default: mockFunctions,
  };
});

// Mock User model - generatePaymentReminders reads the user's notification settings
jest.mock("../models/User", () => {
  const mockUser = {
    findByPk: jest.fn(),
  };

  return {
    __esModule: true,
    User: mockUser,
    default: mockUser,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notification = require("../models/Notification").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const User = require("../models/User").default;
import * as notificationService from "../services/notificationService";

beforeEach(() => {
  jest.clearAllMocks();
  // Default: user has no settings (all notifications enabled)
  User.findByPk.mockResolvedValue({ settings: {}, roles: [{ name: "Gerencia" }] });
});

describe("generatePaymentReminders", () => {
  it("debería crear el recordatorio de Quincena 1 el día 15", async () => {
    Notification.findOne.mockResolvedValue(null);
    const created = { id: 1, source: "payment-1:2026-7", title: "Pago de Quincena 1" };
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.generatePaymentReminders(1, "2026-07-15");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(created);
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: "payment-1:2026-7", title: "Pago de Quincena 1" }),
    );
  });

  it("debería crear el recordatorio de Quincena 2 el último día del mes (31)", async () => {
    Notification.findOne.mockResolvedValue(null);
    const created = { id: 2, source: "payment-2:2026-7", title: "Pago de Quincena 2" };
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.generatePaymentReminders(1, "2026-07-31");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(created);
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: "payment-2:2026-7", title: "Pago de Quincena 2" }),
    );
  });

  it("debería crear el recordatorio de Quincena 2 el último día de febrero (28 en año no bisiesto)", async () => {
    Notification.findOne.mockResolvedValue(null);
    const created = { id: 3, source: "payment-2:2026-2", title: "Pago de Quincena 2" };
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.generatePaymentReminders(1, "2026-02-28");

    expect(result).toHaveLength(1);
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: "payment-2:2026-2" }),
    );
  });

  it("debería crear el recordatorio de Quincena 2 el 29 de febrero en año bisiesto", async () => {
    Notification.findOne.mockResolvedValue(null);
    const created = { id: 4, source: "payment-2:2028-2", title: "Pago de Quincena 2" };
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.generatePaymentReminders(1, "2028-02-29");

    expect(result).toHaveLength(1);
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: "payment-2:2028-2" }),
    );
  });

  it("no debería crear recordatorios en un día cualquiera del mes", async () => {
    const result = await notificationService.generatePaymentReminders(1, "2026-07-10");

    expect(result).toHaveLength(0);
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("no debería duplicar el recordatorio si ya existe con el mismo source", async () => {
    Notification.findOne.mockResolvedValue({
      id: 9,
      source: "payment-1:2026-7",
      title: "Pago de Quincena 1",
    });

    const result = await notificationService.generatePaymentReminders(1, "2026-07-15");

    expect(result).toHaveLength(0);
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("debería manejar el día 15 de un mes de 30 días sin crear Quincena 2", async () => {
    Notification.findOne.mockResolvedValue(null);
    const created = { id: 5, source: "payment-1:2026-6", title: "Pago de Quincena 1" };
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.generatePaymentReminders(1, "2026-06-15");

    expect(result).toHaveLength(1);
    // Solo Quincena 1; junio tiene 30 días, así que el 15 no es el último día
    expect(Notification.create).toHaveBeenCalledTimes(1);
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: "payment-1:2026-6" }),
    );
  });

  it("no debería crear recordatorios si el usuario desactivó los pagos en settings", async () => {
    User.findByPk.mockResolvedValue({
      settings: { notifications: { payments: false } },
      roles: [{ name: "Gerencia" }],
    });

    const result = await notificationService.generatePaymentReminders(1, "2026-07-15");

    expect(result).toHaveLength(0);
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("debería crear recordatorios si el usuario no definió settings.notifications (default on)", async () => {
    User.findByPk.mockResolvedValue({ settings: { theme: "dark" }, roles: [{ name: "Gerencia" }] });
    Notification.findOne.mockResolvedValue(null);
    const created = { id: 6, source: "payment-1:2026-7", title: "Pago de Quincena 1" };
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.generatePaymentReminders(1, "2026-07-15");

    expect(result).toHaveLength(1);
    expect(Notification.create).toHaveBeenCalledTimes(1);
  });
});

describe("createNotification", () => {
  it("debería crear una notificación", async () => {
    const reload = jest.fn();
    const created = { id: 1, title: "Hola", reload };
    reload.mockResolvedValue(created);
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.createNotification(1, {
      title: "Hola",
      message: "Mensaje",
      type: "info",
      category: "system",
      priority: "low",
      source: "system:test",
    });

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Hola", userId: 1 }),
    );
    expect(result).toEqual(created);
  });

  it("debería ser idempotente ante una violación del unique (userId, source)", async () => {
    Notification.create.mockRejectedValue({
      name: "SequelizeUniqueConstraintError",
    });

    const result = await notificationService.createNotification(1, {
      title: "Hola",
      message: "Mensaje",
      type: "info",
      category: "system",
      priority: "low",
      source: "system:test",
    });

    expect(result).toBeNull();
  });
});

describe("getNotificationsByUser", () => {
  it("debería eliminar notificaciones con más de 30 días y devolver el resto", async () => {
    Notification.destroy.mockResolvedValue(1);
    const mockNotifications = [{ id: 1, title: "Notif" }];
    Notification.findAll.mockResolvedValue(mockNotifications);

    const result = await notificationService.getNotificationsByUser(1);

    expect(Notification.destroy).toHaveBeenCalledTimes(1);
    // Sequelize v4 uses string operators
    expect(Notification.destroy.mock.calls[0][0].where.createdAt).toHaveProperty("$lt");
    expect(Notification.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockNotifications);
  });
});

describe("markAsRead", () => {
  it("debería actualizar read=true y devolver la notificación", async () => {
    Notification.update.mockResolvedValue([1]);
    const updated = { id: 1, read: true };
    Notification.findOne.mockResolvedValue(updated);

    const result = await notificationService.markAsRead(1, 1);

    expect(Notification.update).toHaveBeenCalledWith(
      { read: true },
      { where: { id: 1, userId: 1 } },
    );
    expect(Notification.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1, userId: 1 } }),
    );
    expect(result).toEqual(updated);
  });

  it("no devuelve notificaciones de otro usuario", async () => {
    Notification.update.mockResolvedValue([0]);
    Notification.findOne.mockResolvedValue(null);

    const result = await notificationService.markAsRead(2, 1);

    expect(Notification.findByPk).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

describe("preferencias de notificación", () => {
  it("asigna cada clase de aviso a su preferencia", () => {
    const key = notificationService.settingKeyForSource;
    expect(key("vacation-request:3")).toBe("vacations");
    expect(key("boleta-sent:3:1")).toBe("boletas");
    expect(key("license-expiry:3")).toBe("licenses");
    expect(key("disciplinary-created:3")).toBe("disciplines");
    expect(key("employee-terminated:3")).toBe("employees");
    expect(key("schedule-assigned:1:2026-09-01:5")).toBe("schedules");
    expect(key("vehicle-created:3")).toBe("vehicles");
    expect(key("password-changed:3:1")).toBe("users");
    expect(key("role-access-changed:3:1")).toBe("roles");
    expect(key(undefined)).toBeNull();
    expect(key("otro:1")).toBeNull();
  });

  it("no entrega un aviso que el destinatario desactivó", async () => {
    User.findByPk.mockResolvedValue({ settings: { notifications: { vacations: false } } });

    const result = await notificationService.createNotification(1, {
      source: "vacation-decision:4:approved:1",
      title: "Vacaciones aprobadas",
      message: "ok",
    });

    expect(result).toBeNull();
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("entrega el aviso cuando la preferencia está activa o sin definir", async () => {
    User.findByPk.mockResolvedValue({ settings: {} });
    Notification.create.mockResolvedValue({ reload: jest.fn() });

    await notificationService.createNotification(1, {
      source: "vacation-decision:4:approved:1",
      title: "Vacaciones aprobadas",
      message: "ok",
    });

    expect(Notification.create).toHaveBeenCalledTimes(1);
  });
});

describe("destinatarios y actor", () => {
  it("no avisa a quien realizó la acción", async () => {
    const { runAsActor } = require("../utils/actorContext");
    User.findByPk.mockResolvedValue({ settings: {} });

    const result = await runAsActor(5, () =>
      notificationService.createNotification(5, { title: "t", message: "m" }),
    );

    expect(result).toBeNull();
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("sí avisa a otros usuarios aunque haya un actor", async () => {
    const { runAsActor } = require("../utils/actorContext");
    Notification.create.mockResolvedValue({ reload: jest.fn() });

    await runAsActor(5, () =>
      notificationService.createNotification(6, { title: "t", message: "m" }),
    );

    expect(Notification.create).toHaveBeenCalledTimes(1);
  });
});

describe("recordatorios de pago por rol", () => {
  it("no envía el recordatorio a un chofer", async () => {
    User.findByPk.mockResolvedValue({ settings: {}, roles: [{ name: "Chofer" }] });

    const result = await notificationService.generatePaymentReminders(1, "2026-07-15");

    expect(result).toHaveLength(0);
    expect(Notification.create).not.toHaveBeenCalled();
  });
});
