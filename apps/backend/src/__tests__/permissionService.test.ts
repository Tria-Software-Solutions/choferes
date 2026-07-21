
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
  name: "manage_users",
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

    await permissionService.getPermissions({ search: "manage" });

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

describe("getPermissionByName", () => {
  it("debería buscar por nombre", async () => {
    Permission.findOne.mockResolvedValue(mockPermission);

    const result = await permissionService.getPermissionByName("manage_users");

    expect(Permission.findOne).toHaveBeenCalledWith({ where: { name: "manage_users" } });
    expect(result).toEqual(mockPermission);
  });
});

describe("getPermissionsByNames", () => {
  it("debería buscar múltiples permisos por array de nombres", async () => {
    Permission.findAll.mockResolvedValue([mockPermission]);

    const result = await permissionService.getPermissionsByNames(["manage_users", "view_reports"]);

    expect(Permission.findAll).toHaveBeenCalledTimes(1);
    const callArgs = Permission.findAll.mock.calls[0][0];
    expect(callArgs.where.name["$in"]).toEqual(["manage_users", "view_reports"]);
    expect(result).toEqual([mockPermission]);
  });

  it("debería devolver array vacío si no hay coincidencias", async () => {
    Permission.findAll.mockResolvedValue([]);

    const result = await permissionService.getPermissionsByNames(["nonexistent"]);

    expect(result).toEqual([]);
  });
});

describe("createPermission", () => {
  it("debería crear y recargar el permiso", async () => {
    const newData = { name: "view_reports" };
    const createdPermission = { id: 2, ...newData, reload: jest.fn() };

    Permission.create.mockResolvedValue(createdPermission);

    const result = await permissionService.createPermission(newData as never);

    expect(Permission.create).toHaveBeenCalledWith(newData);
    expect(createdPermission.reload).toHaveBeenCalled();
    expect(result).toEqual(createdPermission);
  });
});

describe("updatePermission", () => {
  it("debería actualizar y devolver el permiso actualizado", async () => {
    const updateData = { name: "manage_all" };
    Permission.update.mockResolvedValue([1]);
    Permission.findByPk.mockResolvedValue({ ...mockPermission, name: "manage_all" });

    const result = await permissionService.updatePermission(1, updateData as never);

    expect(Permission.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    expect(result).toHaveProperty("name", "manage_all");
  });
});

describe("deletePermission", () => {
  it("debería eliminar por id", async () => {
    Permission.destroy.mockResolvedValue(1);

    const result = await permissionService.deletePermission(1);

    expect(Permission.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
