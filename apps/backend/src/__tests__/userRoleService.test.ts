// Mock UserRole model — service uses: import { UserRole } from "../models/UserRole" (named import)
jest.mock("../services/notificationService", () => ({
  notifyManagementRoles: jest.fn(),
  notifyEmployeeUser: jest.fn(),
  createNotification: jest.fn(),
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
  it("debería actualizar el rol de un usuario", async () => {
    UserRole.update.mockResolvedValue([1]);
    UserRole.findOne.mockResolvedValue({ ...mockUserRole, roleId: 2 });

    const result = await userRoleService.updateUserRole(1, 2);

    expect(UserRole.update).toHaveBeenCalledWith(
      { userId: 1, roleId: 2 },
      { where: { userId: 1 } },
    );
    expect(result).toHaveProperty("roleId", 2);
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
