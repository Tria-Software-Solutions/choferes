import {
  formatNationalId,
  getFlagEmoji,
  getPlateRestriction,
  nationalityForIdType,
  normalizeNationalId,
  normalizePlate,
  validateNationalId,
  formatPlate,
} from "@choferes/shared";

describe("documento de identidad", () => {
  it("cédula y DIMEX solo guardan dígitos; pasaporte y otros, letras y números en mayúscula", () => {
    expect(normalizeNationalId("cedula", "1-0234-0567")).toBe("102340567");
    expect(normalizeNationalId("dimex", "155-8123456-78")).toBe("155812345678");
    expect(normalizeNationalId("pasaporte", "ab-123 456")).toBe("AB123456");
  });

  it("limita la longitud según el tipo", () => {
    expect(normalizeNationalId("cedula", "12345678901")).toHaveLength(9);
    expect(normalizeNationalId("dimex", "1234567890123456")).toHaveLength(12);
    expect(normalizeNationalId("pasaporte", "A".repeat(40))).toHaveLength(20);
  });

  it("valida cada tipo con su propia regla", () => {
    expect(validateNationalId("cedula", "102340567")).toBe("");
    expect(validateNationalId("dimex", "1558123456")).toMatch(/11 o 12/);
    expect(validateNationalId("dimex", "155812345678")).toBe("");
    expect(validateNationalId("pasaporte", "AB12")).toMatch(/5 caracteres/);
    expect(validateNationalId("pasaporte", "AB1234567")).toBe("");
    // El documento es opcional.
    expect(validateNationalId("dimex", "")).toBe("");
  });

  it("solo la cédula se muestra con guiones", () => {
    expect(formatNationalId("cedula", "102340567")).toBe("1-0234-0567");
    expect(formatNationalId("dimex", "155812345678")).toBe("155812345678");
    expect(formatNationalId("pasaporte", "AB123456")).toBe("AB123456");
  });

  it("la cédula implica Costa Rica; los demás conservan la nacionalidad elegida", () => {
    expect(nationalityForIdType("cedula", "NI")).toBe("CR");
    expect(nationalityForIdType("dimex", "NI")).toBe("NI");
    expect(nationalityForIdType("pasaporte")).toBe("CR");
  });

  it("construye la bandera a partir del código de país", () => {
    expect(getFlagEmoji("CR")).toBe("🇨🇷");
    expect(getFlagEmoji("ni")).toBe("🇳🇮");
    expect(getFlagEmoji("")).toBe("");
    expect(getFlagEmoji("XYZ")).toBe("");
  });
});

describe("restricción vehicular", () => {
  // 2026-09-28 es lunes.
  const day = (offset: number) => new Date(2026, 8, 28 + offset);

  it("asigna el día según el último dígito de la placa", () => {
    const expected: Record<string, string> = {
      "1": "lunes",
      "2": "lunes",
      "3": "martes",
      "4": "martes",
      "5": "miércoles",
      "6": "miércoles",
      "7": "jueves",
      "8": "jueves",
      "9": "viernes",
      "0": "viernes",
    };
    Object.entries(expected).forEach(([digit, name]) => {
      expect(getPlateRestriction(`ABC12${digit}`).dayName).toBe(name);
    });
  });

  it("indica si hoy es su día restringido", () => {
    expect(getPlateRestriction("ABC121", day(0)).restrictedOn).toBe(true); // lunes, termina en 1
    expect(getPlateRestriction("ABC123", day(0)).restrictedOn).toBe(false);
    expect(getPlateRestriction("ABC120", day(4)).restrictedOn).toBe(true); // viernes, termina en 0
  });

  it("no hay restricción en fin de semana", () => {
    [5, 6].forEach((offset) => {
      expect(getPlateRestriction("ABC121", day(offset)).restrictedOn).toBe(false);
      expect(getPlateRestriction("ABC120", day(offset)).restrictedOn).toBe(false);
    });
  });

  it("una placa sin dígito final queda sin día determinado", () => {
    const result = getPlateRestriction("ABCDEF");
    expect(result.dayName).toBeNull();
    expect(result.restrictedOn).toBe(false);
  });

  it("normaliza y da formato a las placas", () => {
    expect(normalizePlate(" bcd-123 ")).toBe("BCD123");
    expect(formatPlate("bcd123")).toBe("BCD-123");
    expect(formatPlate("123456")).toBe("123456");
  });
});
