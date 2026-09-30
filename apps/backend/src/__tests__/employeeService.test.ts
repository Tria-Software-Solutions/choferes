// Mock Employee model - it's imported as DEFAULT export in the service
jest.mock("../services/notificationService", () => ({
  notifyManagementRoles: jest.fn(),
  notifyEmployeeUser: jest.fn(),
  createNotification: jest.fn(),
}));
jest.mock("../models/Employee", () => ({
  __esModule: true,
  default: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Mock HoursWorked
jest.mock("../models/HoursWorked", () => ({
  __esModule: true,
  default: {},
}));

// Mock User. Se exporta con las dos formas porque el servicio lo importa como
// default y positionRoleService como named; deben ser el MISMO objeto para que
// los jest.fn() compartan sus llamadas.
jest.mock("../models/User", () => {
  const model = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };
  return { __esModule: true, default: model, User: model };
});

// Mock Role / UserRole (named imports in the service)
jest.mock("../models/Role", () => ({
  __esModule: true,
  Role: { findOne: jest.fn(), findByPk: jest.fn() },
  default: { findOne: jest.fn(), findByPk: jest.fn() },
}));

jest.mock("../models/UserRole", () => ({
  __esModule: true,
  UserRole: { findOne: jest.fn(), create: jest.fn(), destroy: jest.fn() },
  default: { findOne: jest.fn(), create: jest.fn(), destroy: jest.fn() },
}));

// Quién puede otorgar qué rol se prueba en accessGrantService.test.ts.
jest.mock("../services/accessGrantService", () => ({
  checkRoleGrant: jest.fn(),
}));

// Hashing is irrelevant here and real bcrypt would slow the suite down.
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed"),
  compare: jest.fn(),
}));

import Employee from "../models/Employee";
import { Role } from "../models/Role";
import User from "../models/User";
import { UserRole } from "../models/UserRole";
import * as employeeService from "../services/employeeService";
import { checkRoleGrant } from "../services/accessGrantService";

const mockEmployee = {
  id: 1,
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  isActive: true,
};

// Helper to type-cast mocked Employee methods
const mockFindAndCountAll = Employee.findAndCountAll as jest.Mock;
const mockFindByPk = Employee.findByPk as jest.Mock;
const mockFindOne = Employee.findOne as jest.Mock;
const mockFindAll = Employee.findAll as jest.Mock;
const mockCreate = Employee.create as jest.Mock;
const mockUpdate = Employee.update as jest.Mock;
const mockDestroy = Employee.destroy as jest.Mock;

describe("employeeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEmployees", () => {
    it("debería llamar a findAndCountAll con paginación por defecto", async () => {
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockEmployee],
      });

      const result = await employeeService.getEmployees({});

      expect(mockFindAndCountAll).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual([mockEmployee]);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(50);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("debería ordenar por firstName ASC", async () => {
      mockFindAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await employeeService.getEmployees({});

      const callArgs = mockFindAndCountAll.mock.calls[0][0];
      expect(callArgs.order).toEqual([["firstName", "ASC"]]);
    });

    it("filtra por estado activo/inactivo cuando se envía isActive", async () => {
      mockFindAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await employeeService.getEmployees({ isActive: "false" });

      const callArgs = mockFindAndCountAll.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(false);
    });

    it("no filtra por estado cuando no se envía isActive", async () => {
      mockFindAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await employeeService.getEmployees({});

      const callArgs = mockFindAndCountAll.mock.calls[0][0];
      expect(callArgs.where.isActive).toBeUndefined();
    });

    it("debería manejar paginación personalizada", async () => {
      mockFindAndCountAll.mockResolvedValue({
        count: 100,
        rows: Array(25).fill(mockEmployee),
      });

      const result = await employeeService.getEmployees({
        page: "3",
        limit: "25",
      });

      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(25);
      expect(result.pagination.totalPages).toBe(4);
    });
  });

  describe("getEmployeeById", () => {
    it("debería llamar a findByPk con el id correcto", async () => {
      mockFindByPk.mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeById(1);

      expect(mockFindByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEmployee);
    });

    it("debería devolver null si no existe", async () => {
      mockFindByPk.mockResolvedValue(null);

      const result = await employeeService.getEmployeeById(999);

      expect(result).toBeNull();
    });
  });

  describe("getEmployeeByEmail", () => {
    it("debería buscar por email", async () => {
      mockFindOne.mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeByEmail(
        "juan@example.com",
      );

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: "juan@example.com" },
      });
      expect(result).toEqual(mockEmployee);
    });
  });

  describe("createEmployee", () => {
    it("debería crear y recargar el empleado", async () => {
      const newData = {
        firstName: "María",
        lastName: "García",
        email: "maria@example.com",
      };
      const createdEmployee = { id: 2, ...newData, reload: jest.fn() };

      mockCreate.mockResolvedValue(createdEmployee);

      const result = await employeeService.createEmployee(
        newData as Parameters<typeof employeeService.createEmployee>[0],
      );

      expect(mockCreate).toHaveBeenCalledWith(newData);
      expect(createdEmployee.reload).toHaveBeenCalled();
      expect(result).toEqual(createdEmployee);
    });
  });

  describe("updateEmployee", () => {
    it("debería actualizar y devolver el empleado actualizado", async () => {
      const updateData = { firstName: "Juan Carlos" };
      mockUpdate.mockResolvedValue([1]);
      mockFindByPk.mockResolvedValue({
        ...mockEmployee,
        firstName: "Juan Carlos",
      });

      const result = await employeeService.updateEmployee(
        1,
        updateData as Parameters<typeof employeeService.updateEmployee>[1],
      );

      expect(mockUpdate).toHaveBeenCalledWith(updateData, {
        where: { id: 1 },
      });
      expect(mockFindByPk).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty("firstName", "Juan Carlos");
    });

    it("sin cambio de puesto ni siquiera busca la cuenta vinculada", async () => {
      mockUpdate.mockResolvedValue([1]);
      mockFindByPk.mockResolvedValue(mockEmployee);

      await employeeService.updateEmployee(1, { firstName: "Otro" });

      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("rechaza un puesto desconocido sin guardar nada", async () => {
      await expect(
        employeeService.updateEmployee(1, { position: "cajero" }),
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("rechaza dejar al empleado sin puesto", async () => {
      await expect(
        employeeService.updateEmployee(1, { position: null }),
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    describe("cambio de puesto con cuenta vinculada", () => {
      const mockUserFindOne = User.findOne as jest.Mock;
      const mockRoleFindOne = Role.findOne as jest.Mock;
      const mockUserRoleFindOne = UserRole.findOne as jest.Mock;
      const actor = { id: 1, roles: ["Gerencia"], permissions: ["*"] };

      beforeEach(() => {
        mockUpdate.mockResolvedValue([1]);
        mockFindByPk.mockResolvedValue(mockEmployee);
        mockUserRoleFindOne.mockResolvedValue(null);
        (UserRole.create as jest.Mock).mockResolvedValue({});
        (checkRoleGrant as jest.Mock).mockResolvedValue(null);
      });

      it("pasa la cuenta al rol del nuevo puesto (supervisor → Supervisor)", async () => {
        mockUserFindOne.mockResolvedValue({ id: 9, roles: [{ id: 6, name: "Chofer" }] });
        mockRoleFindOne.mockResolvedValue({ id: 3, name: "Supervisor" });

        await employeeService.updateEmployee(1, { position: "supervisor" }, actor);

        expect(mockRoleFindOne).toHaveBeenCalledWith({ where: { name: "Supervisor" } });
        expect(checkRoleGrant).toHaveBeenCalledWith(actor, 3);
        expect(mockUpdate).toHaveBeenCalledWith({ position: "supervisor" }, { where: { id: 1 } });
        expect(UserRole.destroy).toHaveBeenCalledWith({ where: { userId: 9 } });
        expect(UserRole.create).toHaveBeenCalledWith({ userId: 9, roleId: 3 });
      });

      it("rechaza el cambio de puesto nulo sin tocar la cuenta", async () => {
        await expect(
          employeeService.updateEmployee(1, { position: null }, actor),
        ).rejects.toMatchObject({ statusCode: 400 });

        expect(mockUserFindOne).not.toHaveBeenCalled();
        expect(UserRole.create).not.toHaveBeenCalled();
      });

      it("no toca la cuenta si ya tiene el rol del puesto", async () => {
        mockUserFindOne.mockResolvedValue({ id: 9, roles: [{ id: 3, name: "Supervisor" }] });
        mockRoleFindOne.mockResolvedValue({ id: 3, name: "Supervisor" });

        await employeeService.updateEmployee(1, { position: "supervisor" }, actor);

        expect(UserRole.destroy).not.toHaveBeenCalled();
        expect(UserRole.create).not.toHaveBeenCalled();
      });

      it("respeta las cuentas con rol de gestión o personalizado", async () => {
        mockUserFindOne.mockResolvedValue({
          id: 9,
          roles: [{ id: 1, name: "Gerencia" }],
        });

        await employeeService.updateEmployee(1, { position: "supervisor" }, actor);

        expect(mockUpdate).toHaveBeenCalledWith({ position: "supervisor" }, { where: { id: 1 } });
        expect(UserRole.destroy).not.toHaveBeenCalled();
        expect(UserRole.create).not.toHaveBeenCalled();
      });

      it("rechaza el cambio, sin guardar nada, si quien lo hace no puede otorgar ese rol", async () => {
        mockUserFindOne.mockResolvedValue({ id: 9, roles: [{ id: 6, name: "Chofer" }] });
        mockRoleFindOne.mockResolvedValue({ id: 3, name: "Supervisor" });
        (checkRoleGrant as jest.Mock).mockResolvedValue({
          status: 403,
          message: "No puedes asignar un rol con permisos que tú no tienes",
        });

        await expect(
          employeeService.updateEmployee(
            1,
            { position: "supervisor" },
            { id: 2, roles: ["Administrativo"], permissions: ["employees:edit"] },
          ),
        ).rejects.toMatchObject({ statusCode: 403 });

        expect(mockUpdate).not.toHaveBeenCalled();
        expect(UserRole.create).not.toHaveBeenCalled();
      });
    });
  });

  describe("deleteEmployee", () => {
    it("debería eliminar por id", async () => {
      mockDestroy.mockResolvedValue(1);

      const result = await employeeService.deleteEmployee(1);

      expect(mockDestroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });
  });

  describe("getEmployeesByFilter", () => {
    it("debería filtrar por nombre", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({ name: "juan" });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.name).toBeDefined();
    });

    it("debería filtrar por email", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({ email: "juan@example.com" });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.email).toBeDefined();
    });

    it("debería filtrar por teléfono", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({ phone: "555-0000" });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.phone).toBeDefined();
    });

    it("debería filtrar por documento", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({ document: "12345" });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.document).toBeDefined();
    });

    it("debería filtrar por estado activo", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({ isActive: true });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(true);
    });

    it("debería filtrar por scheduleId", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({ scheduleId: 1 });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.scheduleId).toBe(1);
    });

    it("debería devolver todos si no hay filtros", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({});

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where).toEqual({});
    });

    it("debería combinar múltiples filtros simultáneamente", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      await employeeService.getEmployeesByFilter({
        name: "Juan",
        email: "juan@example.com",
        isActive: true,
        scheduleId: 1,
      });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.name).toBeDefined();
      expect(callArgs.where.email).toBeDefined();
      expect(callArgs.where.isActive).toBe(true);
      expect(callArgs.where.scheduleId).toBe(1);
    });

    it("debería filtrar por isActive=false", async () => {
      mockFindAll.mockResolvedValue([]);

      await employeeService.getEmployeesByFilter({ isActive: false });

      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(false);
    });
  });

  describe("getEmployeeByPhone", () => {
    it("debería buscar por teléfono", async () => {
      mockFindOne.mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeByPhone("555-0000");

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { phone: "555-0000" },
      });
      expect(result).toEqual(mockEmployee);
    });

    it("debería devolver null si no existe", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await employeeService.getEmployeeByPhone("000-0000");

      expect(result).toBeNull();
    });
  });

  describe("getEmployeeByDocument", () => {
    it("debería buscar por documento", async () => {
      mockFindOne.mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeByDocument("12345");

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { document: "12345" },
      });
      expect(result).toEqual(mockEmployee);
    });

    it("debería devolver null si no existe", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await employeeService.getEmployeeByDocument("99999");

      expect(result).toBeNull();
    });
  });

  describe("getEmployeesBySchedule", () => {
    it("debería buscar empleados por scheduleId", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesBySchedule(1);

      expect(mockFindAll).toHaveBeenCalledWith({
        where: { scheduleId: 1 },
      });
      expect(result).toEqual([mockEmployee]);
    });

    it("debería devolver array vacío si no hay empleados", async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await employeeService.getEmployeesBySchedule(999);

      expect(result).toEqual([]);
    });
  });

  describe("getEmployeesByStatus", () => {
    it("debería buscar empleados por estado activo", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesByStatus(true);

      expect(mockFindAll).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual([mockEmployee]);
    });

    it("debería buscar empleados inactivos", async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await employeeService.getEmployeesByStatus(false);

      expect(mockFindAll).toHaveBeenCalledWith({
        where: { isActive: false },
      });
      expect(result).toEqual([]);
    });
  });

  describe("getEmployeesByHireDate", () => {
    it("debería buscar empleados por rango de fecha de contratación", async () => {
      const start = new Date("2026-01-01");
      const end = new Date("2026-12-31");
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesByHireDate(start, end);

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.hireDate["$between"]).toEqual([start, end]);
      expect(result).toEqual([mockEmployee]);
    });

    it("debería devolver array vacío si no hay empleados en el rango", async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await employeeService.getEmployeesByHireDate(
        new Date("2025-01-01"),
        new Date("2025-01-31"),
      );

      expect(result).toEqual([]);
    });
  });

  describe("getEmployeesBySalary", () => {
    it("debería buscar empleados por rango salarial", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesBySalary(1000, 5000);

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where.salary["$between"]).toEqual([1000, 5000]);
      expect(result).toEqual([mockEmployee]);
    });
  });

  describe("updateEmployeeStatus", () => {
    it("debería actualizar estado activo/inactivo", async () => {
      mockUpdate.mockResolvedValue([1]);
      mockFindByPk.mockResolvedValue({
        ...mockEmployee,
        isActive: false,
      });

      const result = await employeeService.updateEmployeeStatus(1, false);

      expect(mockUpdate).toHaveBeenCalledWith(
        { isActive: false },
        { where: { id: 1 } },
      );
      expect(result).toHaveProperty("isActive", false);
    });
  });

  describe("getEmployeesByDepartment", () => {
    it("debería buscar empleados por departamento ordenados por firstName", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesByDepartment("Ventas");

      expect(mockFindAll).toHaveBeenCalledWith({
        where: { department: "Ventas" },
        order: [["firstName", "ASC"]],
      });
      expect(result).toEqual([mockEmployee]);
    });
  });

  describe("getEmployeesByPosition", () => {
    it("debería buscar empleados por puesto ordenados por firstName", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesByPosition("Chofer");

      expect(mockFindAll).toHaveBeenCalledWith({
        where: { position: "Chofer" },
        order: [["firstName", "ASC"]],
      });
      expect(result).toEqual([mockEmployee]);
    });
  });

  describe("getEmployeesBySearch", () => {
    it("debería buscar empleados por término en múltiples campos", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesBySearch("Juan");

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.where["$or"]).toBeDefined();
      expect(callArgs.where["$or"]).toHaveLength(5);
      expect(callArgs.order).toEqual([["firstName", "ASC"]]);
      expect(result).toEqual([mockEmployee]);
    });

    it("debería devolver array vacío si no hay coincidencias", async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await employeeService.getEmployeesBySearch("Xyz");

      expect(result).toEqual([]);
    });
  });

  describe("getEmployeesWithRelations", () => {
    it("debería usar default includeHoursWorked=false si no se pasa argumento", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesWithRelations();

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.include).toEqual([]);
      expect(result).toEqual([mockEmployee]);
    });

    it("debería devolver empleados sin include si includeHoursWorked es false", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesWithRelations(false);

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.include).toEqual([]);
      expect(callArgs.attributes).toEqual(["id", "firstName", "lastName"]);
      expect(result).toEqual([mockEmployee]);
    });

    it("debería incluir hoursWorked si includeHoursWorked es true", async () => {
      mockFindAll.mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesWithRelations(true);

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      const callArgs = mockFindAll.mock.calls[0][0];
      expect(callArgs.include).toHaveLength(1);
      expect(callArgs.include[0].as).toBe("hoursWorked");
      expect(callArgs.include[0].attributes).toEqual(["id", "date", "scheduleId"]);
      expect(result).toEqual([mockEmployee]);
    });
  });

  describe("linkEmployeeToUser", () => {
    const employee = { id: 7, firstName: "Ana", lastName: "Soto", email: "ana@example.com" };

    const mockUserFindOne = User.findOne as jest.Mock;
    const mockUserCreate = User.create as jest.Mock;
    const mockRoleFindOne = Role.findOne as jest.Mock;
    const mockUserRoleFindOne = UserRole.findOne as jest.Mock;
    const mockUserRoleCreate = UserRole.create as jest.Mock;

    it("asigna el rol del puesto a la cuenta recién creada (chofer → Chofer)", async () => {
      mockFindByPk.mockResolvedValue({ ...employee, position: "chofer" });
      // Sin cuenta previa vinculada (y username/email libres).
      mockUserFindOne.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: 42 });
      mockRoleFindOne.mockResolvedValue({ id: 6, name: "Chofer" });
      mockUserRoleCreate.mockResolvedValue({ id: 1, userId: 42, roleId: 6 });

      const result = await employeeService.linkEmployeeToUser(7);

      expect(result.created).toBe(true);
      expect(mockRoleFindOne).toHaveBeenCalledWith({ where: { name: "Chofer" } });
      expect(mockUserRoleCreate).toHaveBeenCalledWith({ userId: 42, roleId: 6 });
    });

    it("da a la cuenta nueva el rol de su puesto (supervisor → Supervisor)", async () => {
      mockFindByPk.mockResolvedValue({ ...employee, position: "supervisor" });
      mockUserFindOne.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: 42 });
      mockRoleFindOne.mockResolvedValue({ id: 3, name: "Supervisor" });
      mockUserRoleCreate.mockResolvedValue({ id: 1, userId: 42, roleId: 3 });
      (checkRoleGrant as jest.Mock).mockResolvedValue(null);
      const actor = { id: 1, roles: ["Gerencia"], permissions: ["*"] };

      await employeeService.linkEmployeeToUser(7, actor);

      expect(mockRoleFindOne).toHaveBeenCalledWith({ where: { name: "Supervisor" } });
      expect(checkRoleGrant).toHaveBeenCalledWith(actor, 3);
      expect(mockUserRoleCreate).toHaveBeenCalledWith({ userId: 42, roleId: 3 });
    });

    it("no crea la cuenta si quien la activa no puede otorgar el rol del puesto", async () => {
      mockFindByPk.mockResolvedValue({ ...employee, position: "supervisor" });
      mockUserFindOne.mockResolvedValue(null);
      mockRoleFindOne.mockResolvedValue({ id: 3, name: "Supervisor" });
      (checkRoleGrant as jest.Mock).mockResolvedValue({
        status: 403,
        message: "No puedes asignar un rol con permisos que tú no tienes",
      });

      await expect(
        employeeService.linkEmployeeToUser(7, { id: 2, roles: [], permissions: ["employees:edit"] }),
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(mockUserCreate).not.toHaveBeenCalled();
    });

    it("repara una cuenta existente que quedó sin rol", async () => {
      mockFindByPk.mockResolvedValue({ ...employee, position: "chofer" });
      mockUserFindOne.mockResolvedValue({ id: 9 });
      mockUserRoleFindOne.mockResolvedValue(null);
      mockRoleFindOne.mockResolvedValue({ id: 6, name: "Chofer" });
      mockUserRoleCreate.mockResolvedValue({ id: 2, userId: 9, roleId: 6 });

      const result = await employeeService.linkEmployeeToUser(7);

      expect(result.created).toBe(false);
      expect(mockUserRoleCreate).toHaveBeenCalledWith({ userId: 9, roleId: 6 });
    });

    it("no duplica el rol cuando la cuenta ya tiene uno", async () => {
      mockFindByPk.mockResolvedValue(employee);
      mockUserFindOne.mockResolvedValue({ id: 9 });
      mockUserRoleFindOne.mockResolvedValue({ id: 3, userId: 9, roleId: 1 });

      const result = await employeeService.linkEmployeeToUser(7);

      expect(result.created).toBe(false);
      expect(mockUserRoleCreate).not.toHaveBeenCalled();
    });
  });

  describe("getEmployeeAccess", () => {
    const mockUserFindOne = User.findOne as jest.Mock;

    it("devuelve hasUser false cuando el empleado no tiene cuenta", async () => {
      mockFindByPk.mockResolvedValue({ id: 7 });
      mockUserFindOne.mockResolvedValue(null);

      const access = await employeeService.getEmployeeAccess(7);

      expect(access).toEqual({
        hasUser: false,
        userId: null,
        username: null,
        roles: [],
        needsRole: false,
      });
    });

    it("marca needsRole cuando la cuenta no tiene roles", async () => {
      mockFindByPk.mockResolvedValue({ id: 7 });
      mockUserFindOne.mockResolvedValue({ id: 9, username: "ana", roles: [] });

      const access = await employeeService.getEmployeeAccess(7);

      expect(access).toMatchObject({ hasUser: true, username: "ana", needsRole: true });
    });

    it("no marca needsRole cuando la cuenta ya tiene rol", async () => {
      mockFindByPk.mockResolvedValue({ id: 7 });
      mockUserFindOne.mockResolvedValue({
        id: 9,
        username: "ana",
        roles: [{ id: 6, name: "Chofer" }],
      });

      const access = await employeeService.getEmployeeAccess(7);

      expect(access.needsRole).toBe(false);
      expect(access.roles).toEqual([{ id: 6, name: "Chofer" }]);
    });

    it("lanza 404 cuando el empleado no existe", async () => {
      mockFindByPk.mockResolvedValue(null);

      await expect(employeeService.getEmployeeAccess(404)).rejects.toThrow("Empleado no encontrado");
    });
  });

  describe("assignDefaultRoleToEmployeeUser", () => {
    const mockUserFindOne = User.findOne as jest.Mock;
    const mockRoleFindOne = Role.findOne as jest.Mock;
    const mockUserRoleFindOne = UserRole.findOne as jest.Mock;
    const mockUserRoleCreate = UserRole.create as jest.Mock;

    it("asigna el rol del puesto y devuelve la cuenta actualizada", async () => {
      mockFindByPk.mockResolvedValue({ id: 7, position: "chofer" });
      // 1) cuenta del empleado, 2) recarga en getEmployeeAccess.
      mockUserFindOne
        .mockResolvedValueOnce({ id: 9 })
        .mockResolvedValueOnce({ id: 9, username: "ana", roles: [{ id: 6, name: "Chofer" }] });
      mockUserRoleFindOne.mockResolvedValue(null);
      mockRoleFindOne.mockResolvedValue({ id: 6, name: "Chofer" });
      mockUserRoleCreate.mockResolvedValue({ id: 1, userId: 9, roleId: 6 });

      const access = await employeeService.assignDefaultRoleToEmployeeUser(7);

      expect(mockUserRoleCreate).toHaveBeenCalledWith({ userId: 9, roleId: 6 });
      expect(access.needsRole).toBe(false);
      expect(access.roles).toEqual([{ id: 6, name: "Chofer" }]);
    });

    it("asigna el rol del puesto del empleado cuando lo tiene", async () => {
      mockFindByPk.mockResolvedValue({ id: 7, position: "chofer_coordinador" });
      mockUserFindOne
        .mockResolvedValueOnce({ id: 9 })
        .mockResolvedValueOnce({
          id: 9,
          username: "ana",
          roles: [{ id: 5, name: "Chofer Coordinador" }],
        });
      mockUserRoleFindOne.mockResolvedValue(null);
      mockRoleFindOne.mockResolvedValue({ id: 5, name: "Chofer Coordinador" });
      mockUserRoleCreate.mockResolvedValue({ id: 1, userId: 9, roleId: 5 });

      await employeeService.assignDefaultRoleToEmployeeUser(7);

      expect(mockRoleFindOne).toHaveBeenCalledWith({ where: { name: "Chofer Coordinador" } });
      expect(mockUserRoleCreate).toHaveBeenCalledWith({ userId: 9, roleId: 5 });
    });

    it("rechaza cuando el empleado no tiene cuenta", async () => {
      mockFindByPk.mockResolvedValue({ id: 7 });
      mockUserFindOne.mockResolvedValue(null);

      await expect(employeeService.assignDefaultRoleToEmployeeUser(7)).rejects.toThrow(
        "El empleado no tiene una cuenta de acceso al sistema",
      );
    });
  });
});
