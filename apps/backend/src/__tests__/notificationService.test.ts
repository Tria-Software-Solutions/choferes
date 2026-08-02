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
  User.findByPk.mockResolvedValue({ settings: {} });
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
    });

    const result = await notificationService.generatePaymentReminders(1, "2026-07-15");

    expect(result).toHaveLength(0);
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("debería crear recordatorios si el usuario no definió settings.notifications (default on)", async () => {
    User.findByPk.mockResolvedValue({ settings: { theme: "dark" } });
    Notification.findOne.mockResolvedValue(null);
    const created = { id: 6, source: "payment-1:2026-7", title: "Pago de Quincena 1" };
    Notification.create.mockResolvedValue(created);

    const result = await notificationService.generatePaymentReminders(1, "2026-07-15");

    expect(result).toHaveLength(1);
    expect(Notification.create).toHaveBeenCalledTimes(1);
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
    Notification.findByPk.mockResolvedValue(updated);

    const result = await notificationService.markAsRead(1, 1);

    expect(Notification.update).toHaveBeenCalledWith(
      { read: true },
      { where: { id: 1, userId: 1 } },
    );
    expect(result).toEqual(updated);
  });
});
