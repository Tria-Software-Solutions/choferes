import { getParentRoute, splitMobileTabs } from "@choferes/shared";

describe("splitMobileTabs", () => {
  it("deja hasta 4 pestañas y Más vacío cuando caben", () => {
    expect(splitMobileTabs(["a", "b", "c"])).toEqual({ tabs: ["a", "b", "c"], more: [] });
    expect(splitMobileTabs(["a", "b", "c", "d"]).more).toEqual([]);
  });

  it("manda el resto a Más cuando no caben", () => {
    const { tabs, more } = splitMobileTabs(["a", "b", "c", "d", "e", "f", "g"]);
    expect(tabs).toEqual(["a", "b", "c", "d"]);
    expect(more).toEqual(["e", "f", "g"]);
  });

  it("no falla sin destinos", () => {
    expect(splitMobileTabs([])).toEqual({ tabs: [], more: [] });
  });
});

describe("getParentRoute", () => {
  it("devuelve la ruta padre de un detalle", () => {
    expect(getParentRoute("/employees/12")).toBe("/employees");
    expect(getParentRoute("/employees/12/")).toBe("/employees");
  });

  it("devuelve null en pantallas de primer nivel", () => {
    expect(getParentRoute("/employees")).toBeNull();
    expect(getParentRoute("/")).toBeNull();
  });
});
