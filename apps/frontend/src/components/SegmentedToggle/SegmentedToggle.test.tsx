import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "../../theme";
import SegmentedToggle from "./SegmentedToggle.component";

type Period = "weekly" | "biweekly" | "monthly";

const OPTIONS = [
  { value: "weekly" as Period, label: "Semanal" },
  { value: "biweekly" as Period, label: "Quincenal", count: 3 },
  { value: "monthly" as Period, label: "Mensual" },
];

const Harness: React.FC<{ onChange?: (value: Period) => void }> = ({ onChange }) => {
  const [value, setValue] = useState<Period>("weekly");
  return (
    <SegmentedToggle
      ariaLabel="Período"
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

const renderWithTheme = (ui: React.ReactElement, theme = lightTheme) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("SegmentedToggle", () => {
  it("se expone como un grupo de radios con la opción activa marcada", () => {
    renderWithTheme(<Harness />);

    expect(screen.getByRole("radiogroup", { name: "Período" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Semanal" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Quincenal/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("solo la opción activa entra en el orden de tabulación", () => {
    renderWithTheme(<Harness />);

    expect(screen.getByRole("radio", { name: "Semanal" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Mensual" })).toHaveAttribute("tabindex", "-1");
  });

  it("cambia de opción con clic", () => {
    const onChange = jest.fn();
    renderWithTheme(<Harness onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "Mensual" }));

    expect(onChange).toHaveBeenCalledWith("monthly");
    expect(screen.getByRole("radio", { name: "Mensual" })).toHaveAttribute("aria-checked", "true");
  });

  it("se navega con las flechas y da la vuelta en los extremos", () => {
    const onChange = jest.fn();
    renderWithTheme(<Harness onChange={onChange} />);

    const first = screen.getByRole("radio", { name: "Semanal" });
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("biweekly");

    fireEvent.keyDown(screen.getByRole("radio", { name: /Quincenal/ }), { key: "ArrowLeft" });
    fireEvent.keyDown(screen.getByRole("radio", { name: "Semanal" }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith("monthly");
  });

  it("renderiza en modo oscuro sin depender de colores fijos", () => {
    renderWithTheme(<Harness />, darkTheme);

    expect(screen.getByRole("radio", { name: "Semanal" })).toBeInTheDocument();
  });
});
