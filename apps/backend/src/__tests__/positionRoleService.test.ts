import {
  EMPLOYEE_POSITIONS,
  POSITION_LINKED_ROLE_NAMES,
  POSITION_ROLE_NAMES,
  ROLE_NAMES,
  getEmployeePositionLabel,
  getPositionForRoleName,
  getRoleNameForPosition,
} from "@choferes/shared";

jest.mock("../services/notificationService", () => ({
  notifyManagementRoles: jest.fn(),
  notifyEmployeeUser: jest.fn(),
  createNotification: jest.fn(),
  notifyAccountRoleChange: jest.fn(),
}));

jest.mock("../models/Employee", () => {
  const mock = { findByPk: jest.fn() };
  return { __esModule: true, default: mock, Employee: mock };
});

jest.mock("../models/User", () => {
  const mock = { findOne: jest.fn(), findByPk: jest.fn() };
  return { __esModule: true, default: mock, User: mock };
});

jest.mock("../models/Role", () => {
  const mock = { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() };
  return { __esModule: true, default: mock, Role: mock };
});

jest.mock("../models/UserRole", () => {
  const mock = { findOne: jest.fn(), create: jest.fn(), destroy: jest.fn() };
  return { __esModule: true, default: mock, UserRole: mock };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Employee = require("../models/Employee").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const User = require("../models/User").default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Role } = require("../models/Role");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { UserRole } = require("../models/UserRole");
import * as positionRole from "../services/positionRoleService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("catálogo de puestos y roles", () => {
  it("los puestos son los mismos roles de acceso", () => {
    expect([...EMPLOYEE_POSITIONS]).toEqual([
      "chofer",
      "chofer_coordinador",
      "recepcionista",
      "supervisor",
      "administrativo",
      "gerencia",
    ]);
    expect(POSITION_ROLE_NAMES).toEqual({
      chofer: "Chofer",
      chofer_coordinador: "Chofer Coordinador",
      recepcionista: "Recepcionista",
      supervisor: "Supervisor",
      administrativo: "Administrativo",
      gerencia: "Gerencia",
    });
    Object.values(POSITION_ROLE_NAMES).forEach((role) => expect(ROLE_NAMES).toContain(role));
  });

  it("cada puesto tiene su rol: solo SysAdmin queda fuera", () => {
    // SysAdmin es el rol especial de la plataforma, no un puesto.
    const rolesWithPosition = ROLE_NAMES.filter((name) => name !== "SysAdmin");
    expect(Object.values(POSITION_ROLE_NAMES).sort()).toEqual([...rolesWithPosition].sort());
  });

  it("los roles que siguen al puesto son exactamente los de puesto", () => {
    expect([...POSITION_LINKED_ROLE_NAMES]).toEqual([
      "Chofer",
      "Chofer Coordinador",
      "Recepcionista",
      "Supervisor",
      "Administrativo",
      "Gerencia",
    ]);
  });

  it("resuelve el rol de un puesto y rechaza valores desconocidos", () => {
    expect(getRoleNameForPosition("supervisor")).toBe("Supervisor");
    expect(getRoleNameForPosition("gerencia")).toBe("Gerencia");
    expect(getRoleNameForPosition("administrativo")).toBe("Administrativo");
    expect(getRoleNameForPosition("cajero")).toBeNull();
    expect(getRoleNameForPosition(null)).toBeNull();
  });

  it("resuelve el puesto a partir del nombre del rol", () => {
    expect(getPositionForRoleName("Chofer")).toBe("chofer");
    expect(getPositionForRoleName("gerencia")).toBe("gerencia");
    expect(getPositionForRoleName("Gerencia")).toBe("gerencia");
    // SysAdmin y los personalizados no siguen a ningún puesto.
    expect(getPositionForRoleName("SysAdmin")).toBeNull();
    expect(getPositionForRoleName("Contabilidad")).toBeNull();
    expect(getPositionForRoleName(null)).toBeNull();
  });

  it("muestra la variante femenina de los puestos que la tienen", () => {
    expect(getEmployeePositionLabel("supervisor", "Femenino")).toBe("Supervisora");
    expect(getEmployeePositionLabel("chofer_coordinador", "Femenino")).toBe("Chofer coordinadora");
    expect(getEmployeePositionLabel("chofer_coordinador", "Masculino")).toBe("Chofer coordinador");
    expect(getEmployeePositionLabel("administrativo", "Femenino")).toBe("Administrativa");
    // "Gerencia" nombra un área, no una persona: no cambia.
    expect(getEmployeePositionLabel("gerencia", "Femenino")).toBe("Gerencia");
    expect(getEmployeePositionLabel("recepcionista", "Femenino")).toBe("Recepcionista");
    expect(getEmployeePositionLabel("chofer", "Femenino")).toBe("Chofer");
    expect(getEmployeePositionLabel("Mecánico", null)).toBe("Mecánico");
    expect(getEmployeePositionLabel(null, null)).toBeNull();
  });
});

describe("normalizePositions", () => {
  it("no hace nada cuando no llegan puestos", () => {
    expect(positionRole.normalizePositions({})).toBeUndefined();
  });

  it("acepta una lista y quita duplicados conservando el orden", () => {
    expect(
      positionRole.normalizePositions({ positions: ["supervisor", "chofer", "supervisor"] }),
    ).toEqual(["supervisor", "chofer"]);
  });

  it("acepta el formato anterior de un solo puesto", () => {
    expect(positionRole.normalizePositions({ position: "chofer" })).toEqual(["chofer"]);
  });

  it("rechaza listas vacías o con puestos desconocidos", () => {
    expect(() => positionRole.normalizePositions({ positions: [] })).toThrow();
    expect(() => positionRole.normalizePositions({ positions: ["cajero"] })).toThrow();
  });
});

describe("resolveRolesForPositions", () => {
  it("devuelve un rol por puesto, sin repetir y en el mismo orden", async () => {
    Role.findAll.mockResolvedValue([
      { id: 3, name: "Supervisor" },
      { id: 6, name: "Chofer" },
    ]);

    const roles = await positionRole.resolveRolesForPositions(["chofer", "supervisor", "chofer"]);

    expect(Role.findAll).toHaveBeenCalledWith({ where: { name: ["Chofer", "Supervisor"] } });
    expect(roles.map((role: { name: string }) => role.name)).toEqual(["Chofer", "Supervisor"]);
  });

  it("rechaza el empleado sin puestos", async () => {
    await expect(positionRole.resolveRolesForPositions([])).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(Role.findAll).not.toHaveBeenCalled();
  });

  it("falla si falta el rol de algún puesto", async () => {
    Role.findAll.mockResolvedValue([{ id: 6, name: "Chofer" }]);

    await expect(
      positionRole.resolveRolesForPositions(["chofer", "supervisor"]),
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe("planAccountRoleChange", () => {
  const accountWith = (...roles: { id: number; name: string }[]) => ({ id: 9, roles });

  it("no hace nada si el empleado no tiene cuenta", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(positionRole.planAccountRoleChange(1, ["supervisor"])).resolves.toBeNull();
  });

  it("no toca cuentas con Gerencia, Administrativo o un rol personalizado", async () => {
    // Aunque Gerencia y Administrativo ahora también son puestos, una cuenta que
    // los tiene no pierde el acceso por que le cambien el puesto en la ficha.
    for (const name of ["Gerencia", "Administrativo", "Contabilidad"]) {
      User.findOne.mockResolvedValue(accountWith({ id: 1, name }));
      // eslint-disable-next-line no-await-in-loop
      await expect(positionRole.planAccountRoleChange(1, ["supervisor"])).resolves.toBeNull();
    }
    expect(Role.findAll).not.toHaveBeenCalled();
  });

  it("no cambia nada cuando la cuenta ya tiene exactamente los roles de sus puestos", async () => {
    User.findOne.mockResolvedValue(
      accountWith({ id: 3, name: "Supervisor" }, { id: 6, name: "Chofer" }),
    );
    Role.findAll.mockResolvedValue([
      { id: 6, name: "Chofer" },
      { id: 3, name: "Supervisor" },
    ]);

    await expect(
      positionRole.planAccountRoleChange(1, ["chofer", "supervisor"]),
    ).resolves.toBeNull();
  });

  it("propone todos los roles cuando el empleado suma un segundo puesto", async () => {
    User.findOne.mockResolvedValue(accountWith({ id: 6, name: "Chofer" }));
    Role.findAll.mockResolvedValue([
      { id: 6, name: "Chofer" },
      { id: 3, name: "Supervisor" },
    ]);

    const change = await positionRole.planAccountRoleChange(1, ["chofer", "supervisor"]);

    expect(change?.userId).toBe(9);
    expect(change?.roles.map((role: { name: string }) => role.name)).toEqual([
      "Chofer",
      "Supervisor",
    ]);
  });

  it("quita el rol del puesto que el empleado ya no tiene", async () => {
    User.findOne.mockResolvedValue(
      accountWith({ id: 6, name: "Chofer" }, { id: 3, name: "Supervisor" }),
    );
    Role.findAll.mockResolvedValue([{ id: 3, name: "Supervisor" }]);

    const change = await positionRole.planAccountRoleChange(1, ["supervisor"]);

    expect(change?.roles).toEqual([{ id: 3, name: "Supervisor" }]);
  });

  it("propone roles a la cuenta que quedó sin ninguno", async () => {
    User.findOne.mockResolvedValue(accountWith());
    Role.findAll.mockResolvedValue([{ id: 6, name: "Chofer" }]);

    const change = await positionRole.planAccountRoleChange(1, ["chofer"]);

    expect(change?.roles[0].name).toBe("Chofer");
  });
});

describe("applyAccountRoles", () => {
  it("deja a la cuenta únicamente con los roles indicados", async () => {
    UserRole.findOne.mockResolvedValue(null);
    UserRole.create.mockResolvedValue({});

    await positionRole.applyAccountRoles(9, [
      { id: 3, name: "Supervisor" },
      { id: 6, name: "Chofer" },
    ] as never);

    expect(UserRole.destroy).toHaveBeenCalledWith({ where: { userId: 9 } });
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 9, roleId: 3 });
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 9, roleId: 6 });
  });
});

describe("assignPositionRoleIfMissing", () => {
  it("no hace nada si la cuenta ya tiene un rol", async () => {
    UserRole.findOne.mockResolvedValue({ userId: 9, roleId: 1 });

    await expect(positionRole.assignPositionRoleIfMissing(9, ["chofer"])).resolves.toEqual([]);
    expect(UserRole.create).not.toHaveBeenCalled();
  });

  it("asigna los roles de los puestos cuando no tiene ninguno", async () => {
    UserRole.findOne.mockResolvedValue(null);
    Role.findAll.mockResolvedValue([
      { id: 6, name: "Chofer" },
      { id: 3, name: "Supervisor" },
    ]);
    UserRole.create.mockResolvedValue({});

    const roles = await positionRole.assignPositionRoleIfMissing(9, ["chofer", "supervisor"]);

    expect(roles.map((role: { name: string }) => role.name)).toEqual(["Chofer", "Supervisor"]);
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 9, roleId: 6 });
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 9, roleId: 3 });
  });
});

describe("checkRolesFitEmployeePositions", () => {
  const linkedSupervisor = () => {
    User.findByPk.mockResolvedValue({ id: 9, employeeId: 4 });
    Employee.findByPk.mockResolvedValue({ id: 4, position: "supervisor", positions: ["supervisor"] });
  };

  it("permite cualquier rol si el usuario no está vinculado a un empleado", async () => {
    User.findByPk.mockResolvedValue({ id: 9, employeeId: null });

    await expect(positionRole.checkRolesFitEmployeePositions(9, [7])).resolves.toBeNull();
  });

  it("permite cualquier rol si el empleado no es supervisor", async () => {
    User.findByPk.mockResolvedValue({ id: 9, employeeId: 4 });
    Employee.findByPk.mockResolvedValue({ id: 4, position: "chofer", positions: ["chofer"] });

    await expect(positionRole.checkRolesFitEmployeePositions(9, [7])).resolves.toBeNull();
  });

  it("también aplica cuando supervisor es uno de varios puestos", async () => {
    User.findByPk.mockResolvedValue({ id: 9, employeeId: 4 });
    Employee.findByPk.mockResolvedValue({
      id: 4,
      position: "chofer",
      positions: ["chofer", "supervisor"],
    });
    Role.findAll.mockResolvedValue([{ id: 7, name: "Chofer" }]);

    const denial = await positionRole.checkRolesFitEmployeePositions(9, [7]);

    expect(denial).toEqual(expect.objectContaining({ status: 409 }));
  });

  it("impide quitarle el rol Supervisor a un supervisor", async () => {
    linkedSupervisor();
    Role.findAll.mockResolvedValue([{ id: 7, name: "Chofer" }]);

    const denial = await positionRole.checkRolesFitEmployeePositions(9, [7]);

    expect(denial).toEqual(expect.objectContaining({ status: 409 }));
    expect(denial?.message).toContain("Supervisor");
  });

  it("permite el rol Supervisor (aunque vaya con otros) y los de gestión", async () => {
    linkedSupervisor();
    for (const names of [["Supervisor"], ["Gerencia"], ["Administrativo"], ["Chofer", "Supervisor"]]) {
      Role.findAll.mockResolvedValue(names.map((name, i) => ({ id: i + 1, name })));
      // eslint-disable-next-line no-await-in-loop
      await expect(
        positionRole.checkRolesFitEmployeePositions(9, names.map((_n, i) => i + 1)),
      ).resolves.toBeNull();
    }
  });
});
