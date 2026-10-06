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
  it("muestra las secciones del formulario con el apodo", () => {
    mountForm();

    expect(screen.getByRole("heading", { name: "Identificación" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contacto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Puesto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contrato y pago" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre preferido/i)).toBeInTheDocument();
  });

  it("no pide vehículos ni saldo de vacaciones en el alta", () => {
    mountForm();

    // Los vehículos se agregan en la ficha; el saldo de vacaciones lo calcula
    // el backend con la regla de la ley (art. 153) al crear el empleado.
    expect(screen.queryByLabelText(/Saldo de vacaciones/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Placa del vehículo")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vehículos propios" })).not.toBeInTheDocument();
  });

  it("envía el alta sin saldo de vacaciones", () => {
    const onSubmit = mountForm();

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Nombre preferido/i), { target: { value: "Carlitos" } });

    fireEvent.click(screen.getByRole("button", { name: /^Crear$/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Juan",
        lastName: "Pérez",
        nationalId: "118820456",
        preferredName: "Carlitos",
        positions: [EMPLOYEE_POSITIONS[0]],
      }),
    );
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty("vacationDays");
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty("vehicles");
  });

  it("prellena la tarifa por hora y deja ajustarla", () => {
    const rate = () => screen.getByLabelText(/^Tarifa por hora$/i) as HTMLInputElement;
    const onSubmit = mountForm();

    expect(rate().value).toBe("1690.46");

    fireEvent.change(rate(), { target: { value: "2500" } });
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /^Crear$/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ hourlyRate: 2500 }));
  });

  it("no habilita el alta sin los campos obligatorios", () => {
    mountForm();

    expect(screen.getByRole("button", { name: /^Crear$/i })).toBeDisabled();

    fillRequiredFields();

    expect(screen.getByRole("button", { name: /^Crear$/i })).not.toBeDisabled();
  });
});
