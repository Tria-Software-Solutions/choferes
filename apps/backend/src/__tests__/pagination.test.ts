// Note: Sequelize v3 uses string-based operators ($or, $iLike)
import {
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
} from "../utils/pagination";

describe("getPaginationParams", () => {
  it("debería devolver defaults cuando no se pasan parámetros", () => {
    const result = getPaginationParams({});
    expect(result).toEqual({ page: 1, limit: 50 });
  });

  it("debería parsear page y limit desde strings", () => {
    const result = getPaginationParams({ page: "3", limit: "25" });
    expect(result).toEqual({ page: 3, limit: 25 });
  });

  it("debería usar default page=1 si el valor es inválido", () => {
    const result = getPaginationParams({ page: "abc", limit: "10" });
    expect(result).toEqual({ page: 1, limit: 10 });
  });

  it("debería usar default limit=50 si el valor es inválido", () => {
    const result = getPaginationParams({ page: "2", limit: "xyz" });
    expect(result).toEqual({ page: 2, limit: 50 });
  });

  it("debería usar page=1 si el valor es menor a 1", () => {
    const result = getPaginationParams({ page: "0", limit: "10" });
    expect(result).toEqual({ page: 1, limit: 10 });
  });

  it("debería cap limit a 500 para prevenir abuso", () => {
    const result = getPaginationParams({ page: "1", limit: "99999" });
    expect(result).toEqual({ page: 1, limit: 500 });
  });

  it("debería aceptar limit=500 (valor máximo)", () => {
    const result = getPaginationParams({ page: "1", limit: "500" });
    expect(result).toEqual({ page: 1, limit: 500 });
  });

  it("debería usar default si page es número negativo", () => {
    const result = getPaginationParams({ page: "-5", limit: "20" });
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it("debería usar default si limit es 0", () => {
    const result = getPaginationParams({ page: "1", limit: "0" });
    expect(result).toEqual({ page: 1, limit: 50 });
  });
});

describe("getSearchParam", () => {
  it("debería devolver undefined si no hay search", () => {
    expect(getSearchParam({})).toBeUndefined();
  });

  it("debería devolver undefined si search es string vacío", () => {
    expect(getSearchParam({ search: "" })).toBeUndefined();
  });

  it("debería devolver undefined si search es solo espacios", () => {
    expect(getSearchParam({ search: "   " })).toBeUndefined();
  });

  it("debería devolver el search term con trim", () => {
    expect(getSearchParam({ search: "  Juan  " })).toBe("Juan");
  });

  it("debería devolver el search term normal", () => {
    expect(getSearchParam({ search: "ABC-123" })).toBe("ABC-123");
  });

  it("debería ignorar otros parámetros", () => {
    expect(
      getSearchParam({ page: "1", limit: "10", search: "test" }),
    ).toBe("test");
  });
});

describe("buildSearchWhere", () => {
  it("debería devolver undefined si no hay search", () => {
    expect(buildSearchWhere(undefined, ["name"])).toBeUndefined();
  });

  it("debería devolver undefined si el array de fields está vacío", () => {
    expect(buildSearchWhere("test", [])).toBeUndefined();
  });

  it("debería construir un Op.or con ILIKE para cada campo", () => {
    const result = buildSearchWhere("juan", ["firstName", "lastName"]);

    expect(result).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where = result as any;
    const orClause: any[] = where["$or"];
    expect(orClause).toHaveLength(2);

    expect(orClause[0].firstName["$iLike"]).toBe("%juan%");
    expect(orClause[1].lastName["$iLike"]).toBe("%juan%");
  });

  it("debería manejar múltiples campos", () => {
    const result = buildSearchWhere("test", [
      "ticket",
      "licensePlate",
      "brand",
    ]);

    expect(result).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orClause: any[] = (result as any)["$or"];
    expect(orClause).toHaveLength(3);
  });

  it("debería escapar caracteres especiales correctamente", () => {
    const result = buildSearchWhere("O'Brien", ["name"]);

    expect(result).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where = result as any;
    const orClause: any[] = where["$or"];
    expect(orClause).toHaveLength(1);
    expect(orClause[0].name["$iLike"]).toBe("%O'Brien%");
  });
});
