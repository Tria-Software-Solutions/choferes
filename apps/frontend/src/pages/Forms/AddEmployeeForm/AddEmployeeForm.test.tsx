import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../../theme";
import { EMPLOYEE_POSITIONS } from "@choferes/shared";
import AddEmployeeForm from "./index";

const mountForm = () => {
  const onSubmit = jest.fn();
  render(
    <ThemeProvider theme={lightTheme}>
      <AddEmployeeForm onSubmit={onSubmit} />
    </ThemeProvider>,
  );
  return onSubmit;
};

// Los selectores múltiples de MUI dejan el menú abierto al elegir y, mientras
// siga abierto, el resto del formulario queda oculto para el lector de pantalla.
const pickMultiSelectOption = (comboboxName: RegExp, optionText: string) => {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: comboboxName }));
  const option = screen
    .getAllByRole("option")
    .find((item) => item.textContent?.includes(optionText)) as HTMLElement;
  fireEvent.click(option);
  fireEvent.keyDown(option, { key: "Escape" });
};

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Juan" } });
  fireEvent.change(screen.getByLabelText(/^Apellido$/i), { target: { value: "Pérez" } });
  fireEvent.change(screen.getByLabelText(/Cédula/), { target: { value: "118820456" } });
  fireEvent.change(screen.getByLabelText(/^Teléfono principal$/i), { target: { value: "88885555" } });
  pickMultiSelectOption(/Puesto/, "Chofer");
};

describe("AddEmployeeForm", () => {
  it("muestra las secciones del formulario con los campos nuevos", () => {
    mountForm();

    expect(screen.getByRole("heading", { name: "Identificación" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contacto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Puesto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contrato y pago" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vehículos propios" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre preferido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Saldo de vacaciones/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Placa del vehículo")).toBeInTheDocument();
  });

  it("envía el apodo, el saldo de vacaciones y los vehículos", () => {
    const onSubmit = mountForm();

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Nombre preferido/i), { target: { value: "Carlitos" } });
    fireEvent.change(screen.getByLabelText(/Saldo de vacaciones/i), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("Placa del vehículo"), { target: { value: "ABC123" } });
    fireEvent.click(screen.getByRole("button", { name: /placa|agregar|añadir/i }));

    fireEvent.click(screen.getByRole("button", { name: /^Crear$/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Juan",
        lastName: "Pérez",
        nationalId: "118820456",
        preferredName: "Carlitos",
        vacationDays: 15,
        vehicles: [expect.objectContaining({ plate: "ABC123" })],
        positions: [EMPLOYEE_POSITIONS[0]],
      }),
    );
  });

  it("no habilita el alta sin los campos obligatorios", () => {
    mountForm();

    expect(screen.getByRole("button", { name: /^Crear$/i })).toBeDisabled();

    fillRequiredFields();

    expect(screen.getByRole("button", { name: /^Crear$/i })).not.toBeDisabled();
  });
});
