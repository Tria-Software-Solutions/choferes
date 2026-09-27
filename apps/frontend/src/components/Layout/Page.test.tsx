import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../theme";
import { EmptyState, PageBody, PageCard, PageContainer, PageHeader } from ".";

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

describe("Page layout", () => {
  it("renderiza el encabezado estándar con título, subtítulo, acciones y toolbar", () => {
    renderWithTheme(
      <PageContainer>
        <PageCard>
          <PageHeader
            icon={<svg data-testid="page-icon" />}
            title="Gestión de Empleados"
            subtitle="28 empleados"
            actions={<button type="button">Exportar</button>}
            toolbar={<input aria-label="Buscar" />}
            toolbarEnd={<button type="button">Nuevo empleado</button>}
          />
          <PageBody>contenido</PageBody>
        </PageCard>
      </PageContainer>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Gestión de Empleados" })).toBeInTheDocument();
    expect(screen.getByText("28 empleados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exportar" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nuevo empleado" })).toBeInTheDocument();
    expect(screen.getByText("contenido")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renderiza solo el título cuando no hay subtítulo ni controles", () => {
    renderWithTheme(<PageHeader title="Reportes" />);

    expect(screen.getByRole("heading", { level: 1, name: "Reportes" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("EmptyState anuncia su contenido y muestra la acción", () => {
    renderWithTheme(
      <EmptyState
        title="No hay vehículos registrados"
        description="Prueba con otra fecha."
        action={<button type="button">Nuevo vehículo</button>}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No hay vehículos registrados");
    expect(screen.getByRole("button", { name: "Nuevo vehículo" })).toBeInTheDocument();
  });
});
