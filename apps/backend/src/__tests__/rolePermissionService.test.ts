// Mock RolePermission model — service uses: import { RolePermission } from "../models/RolePermission" (named import)
jest.mock("../models/RolePermission", () => {
  const mockFunctions = {
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  };
  return { __esModule: true, RolePermission: mockFunctions, default: mockFunctions };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RolePermission = require("../models/RolePermission").default;
import * as rolePermissionService from "../services/rolePermissionService";

const mockRolePermission = {
  id: 1,
  roleId: 1,
  permissionId: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getRolePermissions", () => {
  it("debería devolver todas las asignaciones rol-permiso", async () => {
    RolePermission.findAll.mockResolvedValue([mockRolePermission]);

    const result = await rolePermissionService.getRolePermissions();

    expect(RolePermission.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockRolePermission]);
  });
});

describe("createRolePermission", () => {
  it("debería crear y recargar la asignación", async () => {
    const newData = { roleId: 2, permissionId: 3 };
    const created = { id: 2, ...newData, reload: jest.fn() };

    RolePermission.create.mockResolvedValue(created);

    const result = await rolePermissionService.createRolePermission(newData as never);

    expect(RolePermission.create).toHaveBeenCalledWith(newData);
    expect(created.reload).toHaveBeenCalled();
    expect(result).toEqual(created);
  });
});

describe("updateRolePermission", () => {
  it("debería reemplazar todos los permisos de un rol", async () => {
    const permissionIds = [1, 2, 3];
    RolePermission.destroy.mockResolvedValue(3);
    RolePermission.bulkCreate.mockResolvedValue([
      { roleId: 1, permissionId: 1 },
      { roleId: 1, permissionId: 2 },
      { roleId: 1, permissionId: 3 },
    ]);
    RolePermission.findAll.mockResolvedValue([
      { roleId: 1, permissionId: 1 },
      { roleId: 1, permissionId: 2 },
      { roleId: 1, permissionId: 3 },
    ]);

    const result = await rolePermissionService.updateRolePermission(1, permissionIds);

    expect(RolePermission.destroy).toHaveBeenCalledWith({ where: { roleId: 1 } });
    expect(RolePermission.bulkCreate).toHaveBeenCalledWith([
      { roleId: 1, permissionId: 1 },
      { roleId: 1, permissionId: 2 },
      { roleId: 1, permissionId: 3 },
    ]);
    expect(result).toHaveLength(3);
  });
});

describe("deleteRolePermission", () => {
  it("debería eliminar por id", async () => {
    RolePermission.destroy.mockResolvedValue(1);

    const result = await rolePermissionService.deleteRolePermission(1);

    expect(RolePermission.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});

describe("getRolePermissionsByRoleId", () => {
  it("debería devolver permisos por roleId", async () => {
    RolePermission.findAll.mockResolvedValue([mockRolePermission]);

    const result = await rolePermissionService.getRolePermissionsByRoleId(1);

    expect(RolePermission.findAll).toHaveBeenCalledWith({ where: { roleId: 1 } });
    expect(result).toEqual([mockRolePermission]);
  });

  it("debería devolver array vacío si el rol no tiene permisos", async () => {
    RolePermission.findAll.mockResolvedValue([]);

    const result = await rolePermissionService.getRolePermissionsByRoleId(999);

    expect(result).toEqual([]);
  });
});
