jest.mock("../models/Role", () => {
  const mock = { findByPk: jest.fn() };
  return { __esModule: true, Role: mock, default: mock };
});

jest.mock("../models/Permission", () => {
  const mock = { findAll: jest.fn() };
  return { __esModule: true, Permission: mock, default: mock };
});

jest.mock("../models/UserRole", () => {
  const mock = { findOne: jest.fn(), findAll: jest.fn() };
  return { __esModule: true, UserRole: mock, default: mock };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Role } = require("../models/Role");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Permission } = require("../models/Permission");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { UserRole } = require("../models/UserRole");
import * as accessGrant from "../services/accessGrantService";

const roleWith = (...codes: string[]) => ({ permissions: codes.map((code) => ({ code })) });

const roleNamed = (name: string, ...codes: string[]) => ({
  name,
  permissions: codes.map((code) => ({ code })),
});

// A user-admin who can manage users but holds only a handful of permissions.
const limitedActor = {
  id: 10,
  roles: ["Asistente"],
  permissions: ["users:create", "roles:view"],
};
const superActor = { id: 1, roles: ["Gerencia"], permissions: ["*"] };
const adminActor = { id: 6, roles: ["Administrativo"], permissions: ["users:create"] };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("checkRoleAssignment", () => {
  it("impide asignar un rol con permisos que el usuario no tiene (escalación)", async () => {
    Role.findByPk.mockResolvedValue(roleWith("users:create", "payments:delete", "roles:edit"));

    const denial = await accessGrant.checkRoleAssignment(limitedActor, 20, 1);

    expect(denial).toEqual(expect.objectContaining({ status: 403 }));
  });

  it("permite asignar un rol cuyos permisos ya tiene el usuario", async () => {
    Role.findByPk.mockResolvedValue(roleWith("roles:view"));

    await expect(accessGrant.checkRoleAssignment(limitedActor, 20, 4)).resolves.toBeNull();
  });

  it("un usuario con todos los permisos puede asignar cualquier rol", async () => {
    Role.findByPk.mockResolvedValue(roleWith("payments:delete"));

    await expect(accessGrant.checkRoleAssignment(superActor, 20, 1)).resolves.toBeNull();
  });

  it("un rol de gestión puede asignar un rol de puesto sin replicar sus permisos de autoservicio", async () => {
    Role.findByPk.mockResolvedValue(roleNamed("Chofer", "my-panel:view", "tasks:create"));

    await expect(accessGrant.checkRoleAssignment(superActor, 20, 1)).resolves.toBeNull();
  });

  it("impide a un rol de gestión conceder otro rol de gestión sin conservar sus permisos", async () => {
    Role.findByPk.mockResolvedValue(
      roleNamed("Gerencia", "users:create", "payments:delete", "roles:edit"),
    );

    const denial = await accessGrant.checkRoleAssignment(adminActor, 20, 1);

    expect(denial).toEqual(expect.objectContaining({ status: 403 }));
  });

  it("impide cambiar el propio rol, aun con todos los permisos", async () => {
    UserRole.findAll.mockResolvedValue([{ userId: 1, roleId: 2 }]);

    const denial = await accessGrant.checkRoleAssignment(superActor, 1, 1);

    expect(denial).toEqual(expect.objectContaining({ status: 403 }));
  });

  it("permite reenviar el mismo rol propio (guardar perfil sin cambios)", async () => {
    UserRole.findAll.mockResolvedValue([{ userId: 10, roleId: 3 }]);

    await expect(accessGrant.checkRoleAssignment(limitedActor, 10, 3)).resolves.toBeNull();
    expect(Role.findByPk).not.toHaveBeenCalled();
  });

  it("devuelve 404 si el rol no existe", async () => {
    Role.findByPk.mockResolvedValue(null);

    const denial = await accessGrant.checkRoleAssignment(superActor, 20, 99);

    expect(denial).toEqual(expect.objectContaining({ status: 404 }));
  });
});

describe("checkPermissionGrant", () => {
  const roleEditor = { id: 5, roles: ["x"], permissions: ["roles:edit", "roles:view"] };

  it("impide agregar permisos que el usuario no tiene", async () => {
    Permission.findAll.mockResolvedValue([
      { id: 1, code: "roles:view" },
      { id: 2, code: "payments:delete" },
    ]);
    Role.findByPk.mockResolvedValue(roleWith("roles:view"));

    const denial = await accessGrant.checkPermissionGrant(roleEditor, 3, [1, 2]);

    expect(denial).toEqual(expect.objectContaining({ status: 403 }));
  });

  it("siempre permite quitar permisos, aunque el usuario no los tenga", async () => {
    Permission.findAll.mockResolvedValue([{ id: 1, code: "roles:view" }]);
    Role.findByPk.mockResolvedValue(roleWith("roles:view", "payments:delete"));

    await expect(accessGrant.checkPermissionGrant(roleEditor, 3, [1])).resolves.toBeNull();
  });

  it("rechaza ids de permisos inexistentes", async () => {
    Permission.findAll.mockResolvedValue([{ id: 1, code: "roles:view" }]);

    const denial = await accessGrant.checkPermissionGrant(roleEditor, 3, [1, 999]);

    expect(denial).toEqual(expect.objectContaining({ status: 400 }));
  });

  it("permite vaciar los permisos de un rol", async () => {
    Role.findByPk.mockResolvedValue(roleWith("roles:view"));

    await expect(accessGrant.checkPermissionGrant(roleEditor, 3, [])).resolves.toBeNull();
    expect(Permission.findAll).not.toHaveBeenCalled();
  });
});
