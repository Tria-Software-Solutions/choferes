jest.mock("../models/LicenseRequest", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));
jest.mock("../models/EmployeeLicense", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));
jest.mock("../models/Employee", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));
jest.mock("../services/notificationService", () => ({
  notifyEmployeeUser: jest.fn(),
  notifyManagementRoles: jest.fn(),
}));
jest.mock("../services/employeeLicenseService", () => ({
  createLicense: jest.fn(),
  updateLicense: jest.fn(),
  deleteLicense: jest.fn(),
}));

// Managed transaction: runs the callback with a fake transaction handle.
jest.mock("../config/database", () => ({
  __esModule: true,
  default: { transaction: jest.fn((callback: (t: unknown) => unknown) => callback("tx")) },
}));

import LicenseRequest from "../models/LicenseRequest";
import EmployeeLicense from "../models/EmployeeLicense";
import Employee from "../models/Employee";
import {
  notifyEmployeeUser,
  notifyManagementRoles,
} from "../services/notificationService";
import * as licenseService from "../services/employeeLicenseService";
import {
  approveRequest,
  createRequest,
  listByEmployee,
  rejectRequest,
} from "../services/licenseRequestService";

const LicenseRequestMock = LicenseRequest as unknown as Record<string, jest.Mock>;
const LicenseMock = EmployeeLicense as unknown as Record<string, jest.Mock>;
const EmployeeMock = Employee as unknown as Record<string, jest.Mock>;
const licenseServiceMock = licenseService as unknown as Record<string, jest.Mock>;
const notifyEmployeeMock = notifyEmployeeUser as jest.Mock;
const notifyManagementMock = notifyManagementRoles as jest.Mock;

const employeeRow = { id: 7, firstName: "Ana", lastName: "Rojas" };

// Instancia mínima de LicenseRequest: `get({ plain: true })` es lo que devuelve
// el servicio hacia afuera.
const requestRow = (overrides: Record<string, unknown> = {}) => {
  const state: Record<string, unknown> = {
    id: 3,
    employeeId: 7,
    licenseId: null,
    action: "create",
    payload: { licenseType: "B1" },
    status: "pending",
    ...overrides,
  };
  return {
    ...state,
    get: jest.fn((options?: { plain?: boolean }) => (options?.plain ? { ...state } : state)),
    update: jest.fn(async (values: Record<string, unknown>) => {
      Object.assign(state, values);
      return undefined;
    }),
  };
};

beforeEach(() => jest.clearAllMocks());

describe("createRequest", () => {
  beforeEach(() => {
    EmployeeMock.findByPk.mockResolvedValue(employeeRow);
    LicenseRequestMock.create.mockResolvedValue(requestRow());
    LicenseRequestMock.destroy.mockResolvedValue(1);
    notifyManagementMock.mockResolvedValue(undefined);
  });

  it("registra una licencia nueva como solicitud pendiente y avisa a administración", async () => {
    const request = await createRequest(7, {
      action: "create",
      licenseType: "D1",
      expiresAt: "2029-01-15",
    });

    expect(LicenseRequestMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: 7,
        licenseId: null,
        action: "create",
        status: "pending",
        payload: expect.objectContaining({ licenseType: "D1" }),
      }),
    );
    expect(notifyManagementMock).toHaveBeenCalledTimes(1);
    expect(request).toMatchObject({ id: 3, status: "pending" });
  });

  it("exige la categoría al crear", async () => {
    await expect(createRequest(7, { action: "create" })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(LicenseRequestMock.create).not.toHaveBeenCalled();
  });

  it("rechaza editar una licencia que no pertenece al empleado", async () => {
    LicenseMock.findByPk.mockResolvedValue({ id: 12, employeeId: 99, licenseType: "B1" });

    await expect(
      createRequest(7, { action: "update", licenseId: 12, expiresAt: "2030-01-01" }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(LicenseRequestMock.create).not.toHaveBeenCalled();
  });

  it("reemplaza la solicitud pendiente anterior de la misma licencia", async () => {
    LicenseMock.findByPk.mockResolvedValue({ id: 12, employeeId: 7, licenseType: "B1" });
    LicenseRequestMock.create.mockResolvedValue(
      requestRow({ action: "update", licenseId: 12, payload: { expiresAt: "2030-01-01" } }),
    );

    await createRequest(7, { action: "update", licenseId: 12, expiresAt: "2030-01-01" });

    expect(LicenseRequestMock.destroy).toHaveBeenCalledWith({
      where: { licenseId: 12, status: "pending" },
    });
  });

  it("no acepta una acción desconocida", async () => {
    await expect(
      createRequest(7, { action: "archive" as "create", licenseType: "B1" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("approveRequest", () => {
  it("aplica el cambio a la licencia y cierra la solicitud", async () => {
    const request = requestRow({
      action: "update",
      licenseId: 12,
      payload: { expiresAt: "2030-01-01" },
    });
    LicenseRequestMock.findByPk.mockResolvedValue(request);
    licenseServiceMock.updateLicense.mockResolvedValue({ id: 12 });
    notifyEmployeeMock.mockResolvedValue(undefined);

    await approveRequest(3, 1);

    expect(licenseServiceMock.updateLicense).toHaveBeenCalledWith(
      12,
      { expiresAt: "2030-01-01" },
      { transaction: "tx" },
    );
    expect(request.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved", reviewedBy: 1 }),
      { transaction: "tx" },
    );
    expect(notifyEmployeeMock).toHaveBeenCalledTimes(1);
  });

  it("crea la licencia cuando la solicitud es de alta", async () => {
    const request = requestRow({ action: "create", licenseId: null });
    LicenseRequestMock.findByPk.mockResolvedValue(request);
    licenseServiceMock.createLicense.mockResolvedValue({ id: 44 });
    notifyEmployeeMock.mockResolvedValue(undefined);

    await approveRequest(3, 1);

    expect(licenseServiceMock.createLicense).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 7, licenseType: "B1" }),
      { transaction: "tx" },
    );
  });

  it("no revisa dos veces la misma solicitud", async () => {
    LicenseRequestMock.findByPk.mockResolvedValue(requestRow({ status: "approved" }));

    await expect(approveRequest(3, 1)).rejects.toMatchObject({ statusCode: 409 });
    expect(licenseServiceMock.updateLicense).not.toHaveBeenCalled();
  });

  it("falla si la licencia de la solicitud ya no existe", async () => {
    LicenseRequestMock.findByPk.mockResolvedValue(
      requestRow({ action: "update", licenseId: 12, payload: { notes: "x" } }),
    );
    licenseServiceMock.updateLicense.mockResolvedValue(null);

    await expect(approveRequest(3, 1)).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe("rejectRequest", () => {
  it("cierra la solicitud con el motivo y avisa al empleado", async () => {
    const request = requestRow({ action: "update", licenseId: 12 });
    LicenseRequestMock.findByPk.mockResolvedValue(request);
    notifyEmployeeMock.mockResolvedValue(undefined);

    await rejectRequest(3, 1, "  La fecha no coincide  ");

    expect(request.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        reviewedBy: 1,
        reviewNotes: "La fecha no coincide",
      }),
    );
    expect(licenseServiceMock.updateLicense).not.toHaveBeenCalled();
    expect(notifyEmployeeMock).toHaveBeenCalledTimes(1);
  });
});

describe("listByEmployee", () => {
  it("filtra por empleado y estado", async () => {
    LicenseRequestMock.findAll.mockResolvedValue([requestRow()]);

    const rows = await listByEmployee(7, "pending");

    expect(LicenseRequestMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { employeeId: 7, status: "pending" } }),
    );
    expect(rows).toHaveLength(1);
  });
});
