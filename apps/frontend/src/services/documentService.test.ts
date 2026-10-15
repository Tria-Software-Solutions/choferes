import { isOfficeDocument } from "./documentService";

describe("isOfficeDocument", () => {
  it("reconoce los formatos de oficina", () => {
    expect(isOfficeDocument("Informe.DOCX")).toBe(true);
    expect(isOfficeDocument("planilla.xlsx")).toBe(true);
    expect(isOfficeDocument("charla.pptx")).toBe(true);
    expect(isOfficeDocument("notas.txt")).toBe(true);
    expect(isOfficeDocument("acta.odt")).toBe(true);
  });

  it("descarta lo que no edita el editor de oficina", () => {
    expect(isOfficeDocument("foto.png")).toBe(false);
    expect(isOfficeDocument("contrato.pdf")).toBe(false);
    expect(isOfficeDocument("sin-extension")).toBe(false);
  });
});
