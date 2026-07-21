// Mock Role model — service uses: import { Role } from "../models/Role" (named import)
jest.mock("../models/Role", () => {
  const mockFunctions = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, Role: mockFunctions, default: mockFunctions };
});

// Mock Permission model — needed for include association
jest.mock("../models/Permission", () => ({
  __esModule: true,
  Permission: {},
  default: {},
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Role = require("../models/Role").default;
import * as roleService from "../services/roleService";

const mockRole = {
  id: 1,
  name: "admin",
  description: "Administrator role",
  permissions: [{ id: 1, name: "manage_users" }],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getRoles", () => {
  it("debería llamar a findAndCountAll con paginación por defecto", async () => {
    Role.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockRole] });

    const result = await roleService.getRoles({});

    expect(Role.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockRole]);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(50);
  });

  it("debería incluir permisos en la consulta", async () => {
    Role.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await roleService.getRoles({});

    const callArgs = Role.findAndCountAll.mock.calls[0][0];
    expect(callArgs.include).toBeDefined();
    expect(callArgs.include).toHaveLength(1);
  });

  it("debería pasar search query", async () => {
    Role.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await roleService.getRoles({ search: "admin" });

    const callArgs = Role.findAndCountAll.mock.calls[0][0];
    expect(callArgs.where).toBeDefined();
  });

  it("debería manejar paginación personalizada", async () => {
    Role.findAndCountAll.mockResolvedValue({ count: 50, rows: Array(10).fill(mockRole) });

    const result = await roleService.getRoles({ page: "2", limit: "10" });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalPages).toBe(5);
  });
});

describe("getRoleById", () => {
  it("debería devolver rol por id con permisos", async () => {
    Role.findByPk.mockResolvedValue(mockRole);

    const result = await roleService.getRoleById(1);

    expect(Role.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    expect(result).toEqual(mockRole);
  });

  it("debería devolver null si no existe", async () => {
    Role.findByPk.mockResolvedValue(null);

    const result = await roleService.getRoleById(999);

    expect(result).toBeNull();
  });
});

describe("getRoleByName", () => {
  it("debería buscar por nombre con permisos", async () => {
    Role.findOne.mockResolvedValue(mockRole);

    const result = await roleService.getRoleByName("admin");

    expect(Role.findOne).toHaveBeenCalledWith({
      where: { name: "admin" },
      include: expect.any(Array),
    });
    expect(result).toEqual(mockRole);
  });

  it("debería devolver null si no existe", async () => {
    Role.findOne.mockResolvedValue(null);

    const result = await roleService.getRoleByName("nonexistent");

    expect(result).toBeNull();
  });
});

describe("createRole", () => {
  it("debería crear y recargar el rol", async () => {
    const newData = { name: "editor", description: "Editor role" };
    const createdRole = { id: 2, ...newData, reload: jest.fn() };

    Role.create.mockResolvedValue(createdRole);

    const result = await roleService.createRole(newData as never);

    expect(Role.create).toHaveBeenCalledWith(newData);
    expect(createdRole.reload).toHaveBeenCalled();
    expect(result).toEqual(createdRole);
  });
});

describe("updateRole", () => {
  it("debería actualizar y devolver el rol actualizado", async () => {
    const updateData = { name: "super_admin" };
    Role.update.mockResolvedValue([1]);
    Role.findByPk.mockResolvedValue({ ...mockRole, name: "super_admin" });

    const result = await roleService.updateRole(1, updateData as never);

    expect(Role.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    expect(result).toHaveProperty("name", "super_admin");
  });

  it("debería devolver null si no existe", async () => {
    Role.update.mockResolvedValue([0]);
    Role.findByPk.mockResolvedValue(null);

    const result = await roleService.updateRole(999, { name: "x" } as never);

    expect(result).toBeNull();
  });
});

describe("deleteRole", () => {
  it("debería eliminar por id", async () => {
    Role.destroy.mockResolvedValue(1);

    const result = await roleService.deleteRole(1);

    expect(Role.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });

  it("debería devolver 0 si no existe", async () => {
    Role.destroy.mockResolvedValue(0);

    const result = await roleService.deleteRole(999);

    expect(result).toBe(0);
  });
});
