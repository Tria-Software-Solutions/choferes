// Mock Permission model — service uses: import { Permission } from "../models/Permission" (named import)
jest.mock("../models/Permission", () => {
  const mockFunctions = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, Permission: mockFunctions, default: mockFunctions };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Permission = require("../models/Permission").default;
import * as permissionService from "../services/permissionService";

const mockPermission = {
  id: 1,
  code: "employees:view",
  module: "Empleados",
  name: "Ver Empleados",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getPermissions", () => {
  it("debería llamar a findAndCountAll con paginación por defecto", async () => {
    Permission.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockPermission] });

    const result = await permissionService.getPermissions({});

    expect(Permission.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockPermission]);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(50);
  });

  it("debería ordenar por name ASC", async () => {
    Permission.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await permissionService.getPermissions({});

    const callArgs = Permission.findAndCountAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([["name", "ASC"]]);
  });

  it("debería pasar search query", async () => {
    Permission.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await permissionService.getPermissions({ search: "emple" });

    const callArgs = Permission.findAndCountAll.mock.calls[0][0];
    expect(callArgs.where).toBeDefined();
  });
});

describe("getPermissionById", () => {
  it("debería devolver permiso por id", async () => {
    Permission.findByPk.mockResolvedValue(mockPermission);

    const result = await permissionService.getPermissionById(1);

    expect(Permission.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockPermission);
  });

  it("debería devolver null si no existe", async () => {
    Permission.findByPk.mockResolvedValue(null);

    const result = await permissionService.getPermissionById(999);

    expect(result).toBeNull();
  });
});

describe("getPermissionsByNames", () => {
  it("debería buscar múltiples permisos por array de nombres", async () => {
    Permission.findAll.mockResolvedValue([mockPermission]);

    const result = await permissionService.getPermissionsByNames(["Ver Empleados", "Ver Pagos"]);

    expect(Permission.findAll).toHaveBeenCalledTimes(1);
    const callArgs = Permission.findAll.mock.calls[0][0];
    expect(callArgs.where.name["$in"]).toEqual(["Ver Empleados", "Ver Pagos"]);
    expect(result).toEqual([mockPermission]);
  });

  it("debería devolver array vacío si no hay coincidencias", async () => {
    Permission.findAll.mockResolvedValue([]);

    const result = await permissionService.getPermissionsByNames(["nonexistent"]);

    expect(result).toEqual([]);
  });
});
