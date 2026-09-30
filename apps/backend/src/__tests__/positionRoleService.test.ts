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
  const mock = { findOne: jest.fn(), findByPk: jest.fn() };
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

describe("resolveRoleForPosition", () => {
  it("devuelve el rol con el nombre del puesto", async () => {
    Role.findOne.mockResolvedValue({ id: 3, name: "Supervisor" });

    const role = await positionRole.resolveRoleForPosition("supervisor");

    expect(Role.findOne).toHaveBeenCalledWith({ where: { name: "Supervisor" } });
    expect(role.id).toBe(3);
  });

  it("rechaza el empleado sin puesto", async () => {
    await expect(positionRole.resolveRoleForPosition(null)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(Role.findOne).not.toHaveBeenCalled();
  });

  it("falla si el rol del puesto no existe", async () => {
    Role.findOne.mockResolvedValue(null);

    await expect(positionRole.resolveRoleForPosition("chofer")).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});

describe("planAccountRoleChange", () => {
  const accountWith = (...roles: { id: number; name: string }[]) => ({ id: 9, roles });

  it("no hace nada si el empleado no tiene cuenta", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(positionRole.planAccountRoleChange(1, "supervisor")).resolves.toBeNull();
  });

  it("no toca cuentas con Gerencia, Administrativo o un rol personalizado", async () => {
    // Aunque Gerencia y Administrativo ahora también son puestos, una cuenta que
    // los tiene no pierde el acceso por que le cambien el puesto en la ficha.
    for (const name of ["Gerencia", "Administrativo", "Contabilidad"]) {
      User.findOne.mockResolvedValue(accountWith({ id: 1, name }));
      // eslint-disable-next-line no-await-in-loop
      await expect(positionRole.planAccountRoleChange(1, "supervisor")).resolves.toBeNull();
    }
    expect(Role.findOne).not.toHaveBeenCalled();
  });

  it("sí propone el rol de gerencia a una cuenta operativa que pasa a ese puesto", async () => {
    User.findOne.mockResolvedValue(accountWith({ id: 7, name: "Chofer" }));
    Role.findOne.mockResolvedValue({ id: 1, name: "Gerencia" });

    const change = await positionRole.planAccountRoleChange(1, "gerencia");

    expect(change?.role.name).toBe("Gerencia");
  });

  it("no cambia nada cuando la cuenta ya tiene el rol del puesto", async () => {
    User.findOne.mockResolvedValue(accountWith({ id: 3, name: "Supervisor" }));
    Role.findOne.mockResolvedValue({ id: 3, name: "Supervisor" });

    await expect(positionRole.planAccountRoleChange(1, "supervisor")).resolves.toBeNull();
  });

  it("propone el rol del nuevo puesto cuando la cuenta tiene otro rol operativo", async () => {
    User.findOne.mockResolvedValue(accountWith({ id: 7, name: "Chofer" }));
    Role.findOne.mockResolvedValue({ id: 3, name: "Supervisor" });

    const change = await positionRole.planAccountRoleChange(1, "supervisor");

    expect(change).toEqual({ userId: 9, role: { id: 3, name: "Supervisor" } });
  });

  it("propone un rol a la cuenta que quedó sin ninguno", async () => {
    User.findOne.mockResolvedValue(accountWith());
    Role.findOne.mockResolvedValue({ id: 6, name: "Chofer" });

    const change = await positionRole.planAccountRoleChange(1, "chofer");

    expect(change?.role.name).toBe("Chofer");
  });
});

describe("applyAccountRole", () => {
  it("deja a la cuenta únicamente con el rol indicado", async () => {
    UserRole.findOne.mockResolvedValue(null);
    UserRole.create.mockResolvedValue({});

    await positionRole.applyAccountRole(9, 3);

    expect(UserRole.destroy).toHaveBeenCalledWith({ where: { userId: 9 } });
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 9, roleId: 3 });
  });
});

describe("assignPositionRoleIfMissing", () => {
  it("no hace nada si la cuenta ya tiene un rol", async () => {
    UserRole.findOne.mockResolvedValue({ userId: 9, roleId: 1 });

    await expect(positionRole.assignPositionRoleIfMissing(9, "chofer")).resolves.toBeNull();
    expect(UserRole.create).not.toHaveBeenCalled();
  });

  it("asigna el rol del puesto cuando no tiene ninguno", async () => {
    UserRole.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    Role.findOne.mockResolvedValue({ id: 6, name: "Chofer" });
    UserRole.create.mockResolvedValue({});

    const role = await positionRole.assignPositionRoleIfMissing(9, "chofer");

    expect(role?.name).toBe("Chofer");
    expect(UserRole.create).toHaveBeenCalledWith({ userId: 9, roleId: 6 });
  });
});

describe("checkRoleFitsEmployeePosition", () => {
  const linkedSupervisor = () => {
    User.findByPk.mockResolvedValue({ id: 9, employeeId: 4 });
    Employee.findByPk.mockResolvedValue({ id: 4, position: "supervisor" });
  };

  it("permite cualquier rol si el usuario no está vinculado a un empleado", async () => {
    User.findByPk.mockResolvedValue({ id: 9, employeeId: null });

    await expect(positionRole.checkRoleFitsEmployeePosition(9, 7)).resolves.toBeNull();
  });

  it("permite cualquier rol si el empleado no es supervisor", async () => {
    User.findByPk.mockResolvedValue({ id: 9, employeeId: 4 });
    Employee.findByPk.mockResolvedValue({ id: 4, position: "chofer" });

    await expect(positionRole.checkRoleFitsEmployeePosition(9, 7)).resolves.toBeNull();
  });

  it("impide quitarle el rol Supervisor a un supervisor", async () => {
    linkedSupervisor();
    Role.findByPk.mockResolvedValue({ id: 7, name: "Chofer" });

    const denial = await positionRole.checkRoleFitsEmployeePosition(9, 7);

    expect(denial).toEqual(expect.objectContaining({ status: 409 }));
    expect(denial?.message).toContain("Supervisor");
  });

  it("permite el rol Supervisor y los de gestión, que lo superan", async () => {
    linkedSupervisor();
    for (const name of ["Supervisor", "Gerencia", "Administrativo"]) {
      Role.findByPk.mockResolvedValue({ id: 1, name });
      // eslint-disable-next-line no-await-in-loop
      await expect(positionRole.checkRoleFitsEmployeePosition(9, 1)).resolves.toBeNull();
    }
  });
});
