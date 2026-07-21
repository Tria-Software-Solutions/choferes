// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock generateTokens
jest.mock("../utils/generateSecret", () => ({
  generateTokens: jest.fn(),
}));

// Mock models — User, Role, Permission are all named imports in userService
jest.mock("../models/User", () => {
  const mockFunctions = {
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, User: mockFunctions, default: mockFunctions };
});

jest.mock("../models/Role", () => ({
  __esModule: true,
  Role: {},
  default: {},
}));

jest.mock("../models/Permission", () => ({
  __esModule: true,
  Permission: {},
  default: {},
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const User = require("../models/User").default;
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generateSecret";
import * as userService from "../services/userService";

const mockUser = {
  id: 1,
  firstName: "Admin",
  lastName: "Sistema",
  username: "admin",
  email: "admin@example.com",
  password: "hashed_password",
  isActive: true,
  roles: [
    { id: 1, name: "admin", permissions: [{ id: 1, name: "manage_users" }] },
  ],
};

const mockResponse = {
  cookie: jest.fn(),
} as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("authenticateUser", () => {
  it("debería autenticar con username correcto", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (generateTokens as jest.Mock).mockReturnValue({
      accessToken: "token123",
      refreshToken: "refresh123",
    });

    const result = await userService.authenticateUser("admin", "password123", mockResponse);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", mockUser.password);
    expect(generateTokens).toHaveBeenCalledWith("1", mockResponse);
    expect(result.accessToken).toBe("token123");
    expect(result.refreshToken).toBe("refresh123");
  });

  it("debería autenticar con email correcto", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (generateTokens as jest.Mock).mockReturnValue({
      accessToken: "token123",
      refreshToken: "refresh123",
    });

    const result = await userService.authenticateUser("admin@example.com", "password123", mockResponse);

    expect(result).toBeDefined();
    expect(result.user).toEqual(mockUser);
  });

  it("debería lanzar error si el usuario no existe", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      userService.authenticateUser("unknown", "pass", mockResponse),
    ).rejects.toThrow("User not found");
  });

  it("debería lanzar error si el usuario está inactivo", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });

    await expect(
      userService.authenticateUser("admin", "pass", mockResponse),
    ).rejects.toThrow("User is inactive");
  });

  it("debería lanzar error si la contraseña es incorrecta", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.authenticateUser("admin", "wrong", mockResponse),
    ).rejects.toThrow("Incorrect password");
  });

  it("debería lanzar error si temporalPassword también es incorrecta", async () => {
    const userWithTemporal = {
      ...mockUser,
      temporalPassword: "hashed_temporal",
    };
    (User.findOne as jest.Mock).mockResolvedValue(userWithTemporal);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.authenticateUser("admin", "wrong", mockResponse),
    ).rejects.toThrow("Incorrect password and temporary password");
  });
});

describe("getUsers", () => {
  it("debería devolver usuarios paginados con roles", async () => {
    (User.findAndCountAll as jest.Mock).mockResolvedValue({
      count: 1,
      rows: [mockUser],
    });

    const result = await userService.getUsers({});

    expect(User.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual([mockUser]);
    expect(result.pagination.page).toBe(1);
  });

  it("debería pasar search query", async () => {
    (User.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

    await userService.getUsers({ search: "admin" });

    const callArgs = (User.findAndCountAll as jest.Mock).mock.calls[0][0];
    expect(callArgs.where).toBeDefined();
  });
});

describe("getUserById", () => {
  it("debería devolver usuario por id con roles", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.getUserById(1);

    expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    expect(result).toEqual(mockUser);
  });

  it("debería devolver null si no existe", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    const result = await userService.getUserById(999);

    expect(result).toBeNull();
  });
});

describe("getUserByEmail", () => {
  it("debería buscar por email", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.getUserByEmail("admin@example.com");

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      include: expect.any(Array),
    });
    expect(result).toEqual(mockUser);
  });
});

describe("getUserByUsername", () => {
  it("debería buscar por username", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.getUserByUsername("admin");

    expect(User.findOne).toHaveBeenCalledWith({
      where: { username: "admin" },
      include: expect.any(Array),
    });
    expect(result).toEqual(mockUser);
  });
});

describe("getUserPermissions", () => {
  it("debería agregar permisos únicos de todos los roles", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.getUserPermissions(1);

    expect(result).toEqual(["manage_users"]);
  });

  it("debería devolver null si el usuario no existe", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    const result = await userService.getUserPermissions(999);

    expect(result).toBeNull();
  });
});

describe("createUser", () => {
  it("debería hashear password y crear usuario", async () => {
    const newData = {
      firstName: "Nuevo",
      lastName: "Usuario",
      username: "nuevo",
      email: "nuevo@example.com",
      password: "plain_password",
      isActive: true,
    };
    const createdUser = { id: 2, ...newData, password: "hashed" };

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (User.create as jest.Mock).mockResolvedValue(createdUser);

    const result = await userService.createUser(newData as any);

    expect(bcrypt.hash).toHaveBeenCalledWith("plain_password", 10);
    expect(User.create).toHaveBeenCalledWith(
      { ...newData, password: "hashed" },
      { returning: true },
    );
    expect(result).toEqual(createdUser);
  });
});

describe("updateUser", () => {
  it("debería actualizar y devolver usuario", async () => {
    const updateData = { firstName: "Actualizado" } as any;
    (User.update as jest.Mock).mockResolvedValue([1]);
    (User.findByPk as jest.Mock).mockResolvedValue({
      ...mockUser,
      firstName: "Actualizado",
    });

    const result = await userService.updateUser(1, updateData);

    expect(User.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } });
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty("firstName", "Actualizado");
  });
});

describe("updateUserStatus", () => {
  it("debería actualizar estado activo/inactivo", async () => {
    (User.update as jest.Mock).mockResolvedValue([1]);
    (User.findByPk as jest.Mock).mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    const result = await userService.updateUserStatus(1, false);

    expect(User.update).toHaveBeenCalledWith(
      { isActive: false },
      { where: { id: 1 } },
    );
    expect(result).toHaveProperty("isActive", false);
  });
});

describe("updateUserPassword", () => {
  it("debería hashear y actualizar la contraseña", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("new_hashed");
    (User.update as jest.Mock).mockResolvedValue([1]);
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.updateUserPassword(1, "new_password");

    expect(bcrypt.hash).toHaveBeenCalledWith("new_password", 10);
    expect(User.update).toHaveBeenCalledWith(
      { password: "new_hashed" },
      { where: { id: 1 } },
    );
    expect(result).toBeDefined();
  });
});

describe("updateUserTemporalPassword", () => {
  it("debería hashear y actualizar la contraseña temporal", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("temp_hashed");
    (User.update as jest.Mock).mockResolvedValue([1]);
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.updateUserTemporalPassword(1, "temp_password");

    expect(bcrypt.hash).toHaveBeenCalledWith("temp_password", 10);
    expect(User.update).toHaveBeenCalledWith(
      { temporalPassword: "temp_hashed" },
      { where: { id: 1 } },
    );
    expect(result).toBeDefined();
  });
});

describe("deleteUser", () => {
  it("debería eliminar por id", async () => {
    (User.destroy as jest.Mock).mockResolvedValue(1);

    const result = await userService.deleteUser(1);

    expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
