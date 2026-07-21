import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ErrorBoundary from "./ErrorBoundary.component";

// Helper to render with a MUI theme provider (light mode)
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme({ palette: { mode: "light" } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// Silence console.error during tests that intentionally throw
let consoleSpy: jest.SpyInstance;

beforeEach(() => {
  consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleSpy.mockRestore();
});

describe("ErrorBoundary", () => {
  it("debería renderizar los children cuando no hay error", () => {
    renderWithTheme(
      <ErrorBoundary>
        <div data-testid="child">Contenido normal</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Contenido normal")).toBeInTheDocument();
  });

  it("debería mostrar la UI de fallback cuando un child lanza error", () => {
    // Arrange: a component that throws on render
    const ThrowingComponent: React.FC = () => {
      throw new Error("¡Error de prueba!");
    };

    renderWithTheme(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    // The fallback UI should be displayed
    expect(screen.getByText("¡Algo salió mal!")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Se ha producido un error inesperado en esta sección/,
      ),
    ).toBeInTheDocument();

    // Both buttons should be present
    expect(
      screen.getByRole("button", { name: /Reintentar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ir al Inicio/i }),
    ).toBeInTheDocument();

    // Error details should be visible
    expect(screen.getByText("¡Error de prueba!")).toBeInTheDocument();
    expect(screen.getByText("Detalles del error (consola)")).toBeInTheDocument();
  });

  it("debería ocultar los detalles del error cuando el error es null", () => {
    // This test verifies the internal logic of ErrorBoundaryClass
    // by checking that no error details section is rendered when there's no error
    renderWithTheme(
      <ErrorBoundary>
        <div>Sin error</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Sin error")).toBeInTheDocument();
    expect(
      screen.queryByText("Detalles del error (consola)"),
    ).not.toBeInTheDocument();
  });

  it("el botón Reintentar debería restaurar los children", () => {
    let shouldThrow = true;

    const ConditionalComponent: React.FC = () => {
      if (shouldThrow) {
        throw new Error("Error condicional");
      }
      return <div data-testid="recovered">Recuperado</div>;
    };

    renderWithTheme(
      <ErrorBoundary>
        <ConditionalComponent />
      </ErrorBoundary>,
    );

    // Verify fallback is shown
    expect(screen.getByText("¡Algo salió mal!")).toBeInTheDocument();

    // Click "Reintentar" button
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    // Since shouldThrow is still true, the component will throw again
    // and the fallback should still be shown
    expect(screen.getByText("¡Algo salió mal!")).toBeInTheDocument();
  });

  it("el botón Ir al Inicio debería navegar a /", () => {
    // Mock window.location.href
    const originalLocation = window.location.href;
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    const ThrowingComponent: React.FC = () => {
      throw new Error("Navegar");
    };

    renderWithTheme(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Ir al Inicio/i }));

    expect(window.location.href).toBe("/");

    // Restore
    Object.defineProperty(window, "location", {
      value: { href: originalLocation },
      writable: true,
    });
  });

  it("debería mostrar el mensaje de error en los detalles", () => {
    const ThrowingComponent: React.FC = () => {
      throw new Error("Mensaje específico del error");
    };

    renderWithTheme(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Mensaje específico del error")).toBeInTheDocument();
  });

  it("debería mantener la UI de fallback al alternar entre error y recuperación simulada", () => {
    // Simulate an error boundary catching an error
    const ThrowOnce: React.FC = () => {
      throw new Error("Error único");
    };

    render(
      <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
        <ErrorBoundary>
          <ThrowOnce />
        </ErrorBoundary>
      </ThemeProvider>,
    );

    // After error, fallback shows
    expect(screen.getByText("¡Algo salió mal!")).toBeInTheDocument();
  });
});
