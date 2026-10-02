import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../../theme";
import type { Role } from "../../../models/Role";
import AddUserForm from "./index";

const chofer: Role = {
  id: 1,
  name: "Chofer",
  description: "Maneja y registra entregas",
  permissions: [{ id: 10, code: "my-panel:view", module: "Mi panel", name: "Ver mi panel" }],
};

const sysAdmin: Role = {
  id: 2,
  name: "SysAdmin",
  description: "Acceso total",
  permissions: [
    { id: 10, code: "my-panel:view", module: "Mi panel", name: "Ver mi panel" },
    { id: 11, code: "roles:edit", module: "Roles", name: "Editar roles" },
  ],
};

const mountForm = (
  roles: Role[],
  actor: { permissions?: string[]; roleNames?: string[] } = {},
) => {
  const onSubmit = jest.fn();
  render(
    <ThemeProvider theme={lightTheme}>
      <AddUserForm
        onSubmit={onSubmit}
        roles={roles}
        actorPermissions={actor.permissions}
        actorRoleNames={actor.roleNames}
      />
    </ThemeProvider>,
  );
  return onSubmit;
};

// Abre el selector de roles. Devuelve la función para leer sus opciones una vez.
const openRoleOptions = () => {
  fireEvent.mouseDown(screen.getByRole("combobox"));
  return () => screen.getAllByRole("option");
};

const optionNamed = (options: () => HTMLElement[], name: string) =>
  options().find((option) => option.textContent?.includes(name));

// El selector múltiple deja el menú abierto al elegir y, mientras siga abierto,
// el resto del formulario queda oculto para el lector de pantalla.
const closeRoleMenu = (option: HTMLElement) =>
  fireEvent.keyDown(option, { key: "Escape" });

const fillAccessFields = () => {
  fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Nueva" } });
  fireEvent.change(screen.getByLabelText(/^Apellido$/i), { target: { value: "Cuenta" } });
  fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: "nueva@b.com" } });
  fireEvent.change(screen.getByLabelText(/^Nombre de Usuario$/i), { target: { value: "nueva" } });
  fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: "Nueva#2026" } });
};

describe("AddUserForm", () => {
  it("ofrece SysAdmin en el selector de roles", () => {
    mountForm([chofer, sysAdmin], { permissions: ["*"], roleNames: ["SysAdmin"] });

    const options = openRoleOptions();

    expect(optionNamed(options, "SysAdmin")).toBeDefined();
    expect(optionNamed(options, "Chofer")).toBeDefined();
  });

  it("lista SysAdmin deshabilitado cuando la cuenta no tiene sus permisos", () => {
    mountForm([chofer, sysAdmin], { permissions: ["users:create"], roleNames: ["Administrativo"] });

    const options = openRoleOptions();

    expect(optionNamed(options, "Chofer")).not.toHaveAttribute("aria-disabled", "true");
    expect(optionNamed(options, "SysAdmin")).toHaveAttribute("aria-disabled", "true");
  });

  it("un rol de gestión con los permisos de SysAdmin sí puede elegirlo", () => {
    mountForm([chofer, sysAdmin], {
      permissions: ["my-panel:view", "roles:edit"],
      roleNames: ["Gerencia"],
    });

    const options = openRoleOptions();

    expect(optionNamed(options, "SysAdmin")).not.toHaveAttribute("aria-disabled", "true");
  });

  it("exige al menos un rol para poder crear la cuenta", () => {
    mountForm([chofer, sysAdmin], { permissions: ["*"], roleNames: ["SysAdmin"] });

    // Sin nada escrito el alta sigue deshabilitada.
    expect(screen.getByRole("button", { name: /Crear/i })).toBeDisabled();
  });

  it("envía todos los roles elegidos", () => {
    const onSubmit = mountForm([chofer, sysAdmin], { permissions: ["*"], roleNames: ["SysAdmin"] });

    fillAccessFields();
    const options = openRoleOptions();
    fireEvent.click(optionNamed(options, "Chofer")!);
    const sysAdminOption = optionNamed(options, "SysAdmin")!;
    fireEvent.click(sysAdminOption);
    closeRoleMenu(sysAdminOption);

    fireEvent.click(screen.getByRole("button", { name: /Crear/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ roleNames: ["Chofer", "SysAdmin"] }),
    );
  });

  it("no deja crear la cuenta sin roles", () => {
    const onSubmit = mountForm([chofer, sysAdmin], { permissions: ["*"], roleNames: ["SysAdmin"] });

    fillAccessFields();

    expect(screen.getByRole("button", { name: /Crear/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
