import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SearchBarComponent from "./SearchBar.component";

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme({ palette: { mode: "light" } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("SearchBarComponent", () => {
  it("debería renderizar con el placeholder por defecto", () => {
    renderWithTheme(
      <SearchBarComponent value="" onChange={jest.fn()} />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Buscar...");
  });

  it("debería mostrar el placeholder personalizado", () => {
    renderWithTheme(
      <SearchBarComponent
        value=""
        onChange={jest.fn()}
        placeholder="Buscar empleados..."
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Buscar empleados...");
  });

  it("debería llamar a onChange cuando el usuario escribe", () => {
    const handleChange = jest.fn();

    renderWithTheme(
      <SearchBarComponent value="" onChange={handleChange} />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Juan" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("debería mostrar el botón de limpiar cuando hay valor", () => {
    renderWithTheme(
      <SearchBarComponent value="test" onChange={jest.fn()} />,
    );

    const clearButton = screen.getByRole("button", { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it("debería ocultar el botón de limpiar cuando no hay valor", () => {
    renderWithTheme(
      <SearchBarComponent value="" onChange={jest.fn()} />,
    );

    const clearButton = screen.queryByRole("button", { name: /clear/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it("debería limpiar el input al hacer clic en el botón X", () => {
    const handleChange = jest.fn();

    renderWithTheme(
      <SearchBarComponent value="texto a limpiar" onChange={handleChange} />,
    );

    const clearButton = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: "" }),
      }),
    );
  });

  it("debería mostrar un spinner cuando isSearching es true y hay valor", () => {
    renderWithTheme(
      <SearchBarComponent
        value="buscando..."
        onChange={jest.fn()}
        isSearching
      />,
    );

    // The search icon should be replaced by CircularProgress
    // We can check that the spinner role is present
    // CircularProgress renders as a role="progressbar" element
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("debería mostrar el ícono de búsqueda cuando no está buscando", () => {
    renderWithTheme(
      <SearchBarComponent
        value=""
        onChange={jest.fn()}
        isSearching={false}
      />,
    );

    // When not searching, no progressbar should be present
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("debería tener aria-label en el input", () => {
    renderWithTheme(
      <SearchBarComponent
        value=""
        onChange={jest.fn()}
        placeholder="Mi búsqueda"
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "Mi búsqueda");
  });

  it("debería aplicar fullWidth cuando se pasa la prop", () => {
    renderWithTheme(
      <SearchBarComponent value="" onChange={jest.fn()} fullWidth />,
    );

    // The MUI TextField with fullWidth renders a wrapper with width: 100%
    const wrapper = screen.getByTestId("search-bar-wrapper");
    expect(wrapper).toHaveStyle("width: 100%");
  });

  it("debería mostrar el botón de limpiar incluso durante la búsqueda", () => {
    renderWithTheme(
      <SearchBarComponent
        value="test"
        onChange={jest.fn()}
        isSearching
      />,
    );

    // The clear button should still be visible during search
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();

    // And the spinner should also be present
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
