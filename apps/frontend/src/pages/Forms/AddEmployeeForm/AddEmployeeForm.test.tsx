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

// 349 días antes de hoy: con el ingreso y la referencia incluidos son 350 días
// trabajados, justo un ciclo completo de 50 semanas (10 días hábiles).
const fullCycleStartStr = () => {
  const date = new Date();
  date.setDate(date.getDate() - 349);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
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

  it("no pide vehículos en el alta pero sí el saldo de vacaciones", () => {
    mountForm();

    // Los vehículos se agregan en la ficha; el saldo sí se captura aquí.
    expect(screen.getByLabelText(/Saldo de vacaciones/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Placa del vehículo")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vehículos propios" })).not.toBeInTheDocument();
  });

  it("propone el saldo que otorga la ley y lo manda en el alta", () => {
    const onSubmit = mountForm();

    // Ingreso hoy: un solo día de un ciclo de 350 da 0.03 días hábiles.
    expect((screen.getByLabelText(/Saldo de vacaciones/i) as HTMLInputElement).value).toBe("0.03");

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Nombre preferido/i), { target: { value: "Carlitos" } });

    fireEvent.click(screen.getByRole("button", { name: /^Crear$/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Juan",
        lastName: "Pérez",
        nationalId: "118820456",
        preferredName: "Carlitos",
        vacationDays: 0.03,
        positions: [EMPLOYEE_POSITIONS[0]],
      }),
    );
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty("vehicles");
  });

  it("recalcula el saldo al cambiar la fecha de ingreso mientras nadie lo edite", () => {
    mountForm();
    const days = () => screen.getByLabelText(/Saldo de vacaciones/i) as HTMLInputElement;

    // Ciclo completo = 10 días hábiles (art. 153).
    fireEvent.change(screen.getByLabelText(/Fecha de contrato/i), {
      target: { value: fullCycleStartStr() },
    });
    expect(days().value).toBe("10");
  });

  it("deja ajustar el saldo a mano y ya no lo recalcula", () => {
    const onSubmit = mountForm();
    const days = () => screen.getByLabelText(/Saldo de vacaciones/i) as HTMLInputElement;

    fireEvent.change(days(), { target: { value: "4.5" } });
    fireEvent.change(screen.getByLabelText(/Fecha de contrato/i), {
      target: { value: fullCycleStartStr() },
    });
    expect(days().value).toBe("4.5");

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /^Crear$/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ vacationDays: 4.5 }));
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
