import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "../../theme";
import { DotsLoader } from "./DotsLoader.component";

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

const readStyleRules = () =>
  Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch {
        return [];
      }
    })
    .map((rule) => rule.cssText || "")
    .join("\n");

describe("DotsLoader", () => {
  it("inyecta las keyframes de la onda y cablea los tres puntos", () => {
    renderWithTheme(<DotsLoader size="lg" label="Cargando" />);

    const css = readStyleRules();
    expect(css).toContain("scale(0.5)");
    expect(css).toContain(".dots-orb-a");
    expect(css).toContain(".dots-orb-b");
    expect(css).toContain(".dots-orb-c");
  });

  it("expone role progressbar solo cuando hay label", () => {
    const { rerender } = renderWithTheme(<DotsLoader label="Cargando" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <DotsLoader />
      </ThemeProvider>,
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
