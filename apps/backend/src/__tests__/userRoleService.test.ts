// Mock UserRole model — service uses: import { UserRole } from "../models/UserRole" (named import)
jest.mock("../services/notificationService", () => ({
  notifyManagementRoles: jest.fn(),
  notifyEmployeeUser: jest.fn(),
  createNotification: jest.fn(),
  notifyAccountRoleChange: jest.fn(),
}));
jest.mock("../models/UserRole", () => {
  const mockFunctions = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, UserRole: mockFunctions, default: mockFunctions };
});

jest.mock("../models/Role", () => {
  const mockFunctions = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  };
  return { __esModule: true, Role: mockFunctions, default: mockFunctions };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const UserRole = require("../models/UserRole").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Role = require("../models/Role").default;
import * as userRoleService from "../services/userRoleService";

const mockUserRole = {
  id: 1,
  userId: 1,
  roleId: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getUserRoles", () => {
  it("debería devolver todas las asignaciones usuario-rol", async () => {
    UserRole.findAll.mockResolvedValue([mockUserRole]);

    const result = await userRoleService.getUserRoles();

    expect(UserRole.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockUserRole]);
  });
});

describe("getUserRoleByUserId", () => {
  it("debería devolver asignación por userId", async () => {
    UserRole.findOne.mockResolvedValue(mockUserRole);

    const result = await userRoleService.getUserRoleByUserId(1);

    expect(UserRole.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(result).toEqual(mockUserRole);
  });

  it("debería devolver null si no existe", async () => {
    UserRole.findOne.mockResolvedValue(null);

    const result = await userRoleService.getUserRoleByUserId(999);

    expect(result).toBeNull();
  });
});

describe("getUserRoleByRoleId", () => {
  it("debería devolver asignación por roleId", async () => {
    UserRole.findOne.mockResolvedValue(mockUserRole);

    const result = await userRoleService.getUserRoleByRoleId(1);

    expect(UserRole.findOne).toHaveBeenCalledWith({ where: { roleId: 1 } });
    expect(result).toEqual(mockUserRole);
  });
});

describe("createUserRole", () => {
  it("debería crear y recargar la asignación", async () => {
    const newData = { userId: 3, roleId: 2 };
    const created = { id: 2, ...newData, reload: jest.fn() };

    UserRole.create.mockResolvedValue(created);

    const result = await userRoleService.createUserRole(newData as never);

    expect(UserRole.create).toHaveBeenCalledWith(newData);
    expect(created.reload).toHaveBeenCalled();
    expect(result).toEqual(created);
  });
});

describe("updateUserRole", () => {
  it("reemplaza el rol de un usuario por otro", async () => {
    UserRole.findAll.mockResolvedValue([{ userId: 1, roleId: 1 }]);
    UserRole.findOne
      .mockResolvedValueOnce(null) // assignRole: aún no tiene el rol 2
      .mockResolvedValue({ ...mockUserRole, roleId: 2 });
    UserRole.create.mockResolvedValue({});
    Role.findAll.mockResolvedValue([{ id: 2, name: "Chofer" }]);

    const result = await userRoleService.updateUserRole(1, 2);

    expect(UserRole.destroy).toHaveBeenCalledWith({ where: { userId: 1, roleId: [1] } });
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 1, roleId: 2 });
    expect(result).toHaveProperty("roleId", 2);
  });

  it("deja al usuario con varios roles a la vez", async () => {
    UserRole.findAll.mockResolvedValue([{ userId: 1, roleId: 1 }]);
    UserRole.findOne.mockResolvedValue(null);
    UserRole.create.mockResolvedValue({});
    Role.findAll.mockResolvedValue([
      { id: 1, name: "Chofer" },
      { id: 4, name: "Supervisor" },
    ]);

    await userRoleService.updateUserRole(1, [1, 4]);

    expect(UserRole.destroy).not.toHaveBeenCalled();
    expect(UserRole.create).toHaveBeenCalledTimes(1);
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 1, roleId: 4 });
  });

  it("no toca nada cuando los roles no cambian", async () => {
    UserRole.findAll.mockResolvedValue([{ userId: 1, roleId: 1 }]);
    UserRole.findOne.mockResolvedValue({ ...mockUserRole });

    await userRoleService.updateUserRole(1, [1]);

    expect(UserRole.destroy).not.toHaveBeenCalled();
    expect(UserRole.create).not.toHaveBeenCalled();
  });
});

describe("deleteUserRole", () => {
  it("debería eliminar por id", async () => {
    UserRole.findByPk.mockResolvedValue({ ...mockUserRole, destroy: jest.fn().mockResolvedValue(1) });
    Role.findByPk.mockResolvedValue({ roleId: 1, name: "Administrador" });
    UserRole.destroy.mockResolvedValue(1);

    const result = await userRoleService.deleteUserRole(1);

    expect(UserRole.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
