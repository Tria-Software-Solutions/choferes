import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../../theme";
import APPBAR_MENU from "../../../constants/appbar.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import QuickAccessTab from "./QuickAccessTab";

let mockPermissions: string[] = [];
let mockRoles: Array<{ name: string }> = [];

jest.mock("../../../context/AuthContext", () => ({
  useAuthContext: () => ({
    userPermissions: mockPermissions,
    currentUser: { id: 1, roles: mockRoles },
  }),
}));

const renderTab = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <QuickAccessTab />
    </ThemeProvider>,
  );

// Accesos listados (uno por interruptor), en el orden en que se muestran.
const listedLabels = (): string[] =>
  screen.getAllByRole("checkbox").map((input) =>
    (input.getAttribute("aria-label") ?? "")
      .replace(/^Mostrar /, "")
      .replace(/ en la barra superior$/, ""),
  );

describe("QuickAccessTab", () => {
  beforeEach(() => {
    localStorage.clear();
    mockRoles = [{ name: "Gerencia" }];
  });

  it("solo lista los accesos que los permisos del rol permiten ver", () => {
    mockPermissions = [PERMISSIONS.VIEW_MY_PANEL, PERMISSIONS.VIEW_TASKS];
    renderTab();

    expect(listedLabels()).toEqual([
      APPBAR_MENU.MY_PANEL,
      APPBAR_MENU.TASKS,
      APPBAR_MENU.PROFILE,
    ]);
  });

  it("lista Roles solo cuando el rol tiene el permiso de ver Roles", () => {
    mockPermissions = [PERMISSIONS.VIEW_ROLES];
    renderTab();

    expect(listedLabels()).toEqual([APPBAR_MENU.ROLES, APPBAR_MENU.PROFILE]);
  });

  it("lista Roles a un rol operativo con el permiso (lectura)", () => {
    mockPermissions = [PERMISSIONS.VIEW_ROLES];
    mockRoles = [{ name: "Supervisor" }];
    renderTab();

    expect(listedLabels()).toEqual([APPBAR_MENU.ROLES, APPBAR_MENU.PROFILE]);
  });

  it("un rol sin permisos solo ve Configuración", () => {
    mockPermissions = [];
    renderTab();

    expect(listedLabels()).toEqual([APPBAR_MENU.PROFILE]);
  });

  it("vuelve a sembrar el orden guardado por una versión anterior", () => {
    // Un orden guardado antes de que existiera "Mi Panel" lo dejaba al final
    // (después de Tareas); ahora se muestra en su posición por defecto.
    localStorage.setItem(
      "menuPreferences",
      JSON.stringify({
        _order: [APPBAR_MENU.TASKS, APPBAR_MENU.MY_PANEL, APPBAR_MENU.PROFILE],
      }),
    );
    mockPermissions = [PERMISSIONS.VIEW_MY_PANEL, PERMISSIONS.VIEW_TASKS];
    renderTab();

    expect(listedLabels()).toEqual([
      APPBAR_MENU.MY_PANEL,
      APPBAR_MENU.TASKS,
      APPBAR_MENU.PROFILE,
    ]);
  });

  it("inserta una página nueva en su posición canónica, no al final", () => {
    localStorage.setItem(
      "menuPreferences",
      JSON.stringify({
        // Tareas falta en el orden guardado y debe volver tras Mi Panel, no
        // al final de la lista.
        _order: [APPBAR_MENU.MY_PANEL, APPBAR_MENU.PROFILE],
        _orderVersion: 2,
      }),
    );
    mockPermissions = [PERMISSIONS.VIEW_MY_PANEL, PERMISSIONS.VIEW_TASKS];
    renderTab();

    expect(listedLabels()).toEqual([
      APPBAR_MENU.MY_PANEL,
      APPBAR_MENU.TASKS,
      APPBAR_MENU.PROFILE,
    ]);
  });

  it("reordena respetando solo los accesos permitidos", () => {
    mockPermissions = [PERMISSIONS.VIEW_MY_PANEL, PERMISSIONS.VIEW_TASKS];
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: `Mover ${APPBAR_MENU.MY_PANEL} hacia abajo` }));

    expect(listedLabels()).toEqual([
      APPBAR_MENU.TASKS,
      APPBAR_MENU.MY_PANEL,
      APPBAR_MENU.PROFILE,
    ]);
  });
});
