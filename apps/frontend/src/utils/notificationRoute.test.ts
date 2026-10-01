import { PERMISSION_CODES as PERMISSIONS } from "../constants/permissions.constants";
import { resolveNotificationUrl } from "./notificationRoute";

const manager = {
  isManagement: true,
  permissions: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.VIEW_TASKS,
  ],
};
const driver = { isManagement: false, permissions: [PERMISSIONS.VIEW_MY_PANEL, PERMISSIONS.VIEW_TASKS] };

describe("resolveNotificationUrl", () => {
  it("lleva al gerente directo a las vacaciones del empleado", () => {
    expect(resolveNotificationUrl("/employees/7?tab=vacations", manager)).toBe(
      "/employees/7?tab=vacations",
    );
  });

  it("lleva al chofer a la pestaña de su panel (/my-panel)", () => {
    expect(resolveNotificationUrl("/my-panel?tab=vacations", driver)).toBe(
      "/my-panel?tab=vacations",
    );
  });

  it("manda a la pantalla de inicio a quien no tiene Mi Panel (gestión)", () => {
    expect(resolveNotificationUrl("/my-panel", manager)).toBe("/");
    expect(resolveNotificationUrl("/my-panel?tab=payments", manager)).toBe("/");
  });

  it("no manda a Empleados a quien no puede verlos", () => {
    expect(resolveNotificationUrl("/employees/7?tab=payments", driver)).toBeNull();
  });

  it("abre Configuración sin pestaña de administración si no hay acceso", () => {
    expect(resolveNotificationUrl("/settings?tab=users", driver)).toBe("/settings");
    expect(resolveNotificationUrl("/settings?tab=users", manager)).toBe("/settings?tab=users");
    expect(resolveNotificationUrl("/settings?tab=password", driver)).toBe("/settings?tab=password");
  });

  it("ignora notificaciones sin destino", () => {
    expect(resolveNotificationUrl(undefined, manager)).toBeNull();
  });
});
