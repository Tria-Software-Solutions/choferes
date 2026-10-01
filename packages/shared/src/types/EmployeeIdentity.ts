// Documento de identidad del empleado. Los costarricenses usan la cédula (9
// dígitos); los extranjeros pueden tener DIMEX (residentes, 11–12 dígitos),
// pasaporte u otro documento, con más caracteres e incluso letras. La
// nacionalidad se guarda como código ISO 3166-1 alfa-2 y de ahí sale la bandera.

export const NATIONAL_ID_TYPES = ["cedula", "dimex", "pasaporte", "otro"] as const;
export type NationalIdType = (typeof NATIONAL_ID_TYPES)[number];

export const NATIONAL_ID_TYPE_LABELS: Record<NationalIdType, string> = {
  cedula: "Cédula de identidad",
  dimex: "DIMEX (residente extranjero)",
  pasaporte: "Pasaporte",
  otro: "Otro documento",
};

export const DEFAULT_NATIONALITY = "CR";

/** Países que se ofrecen en el selector de nacionalidad (código → nombre). */
export const COUNTRY_NAMES: Readonly<Record<string, string>> = {
  CR: "Costa Rica",
  NI: "Nicaragua",
  PA: "Panamá",
  SV: "El Salvador",
  GT: "Guatemala",
  HN: "Honduras",
  BZ: "Belice",
  MX: "México",
  CO: "Colombia",
  VE: "Venezuela",
  EC: "Ecuador",
  PE: "Perú",
  BO: "Bolivia",
  CL: "Chile",
  AR: "Argentina",
  UY: "Uruguay",
  PY: "Paraguay",
  BR: "Brasil",
  CU: "Cuba",
  DO: "República Dominicana",
  HT: "Haití",
  JM: "Jamaica",
  TT: "Trinidad y Tobago",
  PR: "Puerto Rico",
  US: "Estados Unidos",
  CA: "Canadá",
  ES: "España",
  FR: "Francia",
  DE: "Alemania",
  IT: "Italia",
  PT: "Portugal",
  GB: "Reino Unido",
  NL: "Países Bajos",
  CH: "Suiza",
  RU: "Rusia",
  UA: "Ucrania",
  CN: "China",
  JP: "Japón",
  KR: "Corea del Sur",
  IN: "India",
  IL: "Israel",
  LB: "Líbano",
  MA: "Marruecos",
  EG: "Egipto",
  NG: "Nigeria",
  ZA: "Sudáfrica",
  AU: "Australia",
  NZ: "Nueva Zelanda",
};

export const COUNTRY_CODES: readonly string[] = Object.keys(COUNTRY_NAMES);

export const isCountryCode = (value: unknown): value is string =>
  typeof value === "string" && value in COUNTRY_NAMES;

export const getCountryName = (code: string | null | undefined): string | null =>
  code ? COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase() : null;

/** Bandera de un país a partir de su código ISO (emoji de indicadores regionales). */
export const getFlagEmoji = (code: string | null | undefined): string => {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
};

/** El tipo de documento fija la nacionalidad cuando solo puede ser una. */
export const nationalityForIdType = (
  type: NationalIdType,
  current?: string | null,
): string => (type === "cedula" ? DEFAULT_NATIONALITY : current || DEFAULT_NATIONALITY);

const ALPHANUMERIC_TYPES: readonly NationalIdType[] = ["pasaporte", "otro"];

export const NATIONAL_ID_MAX_LENGTH: Record<NationalIdType, number> = {
  cedula: 9,
  dimex: 12,
  pasaporte: 20,
  otro: 20,
};

/**
 * Deja el documento como se guarda: solo dígitos para cédula y DIMEX; letras y
 * números en mayúscula (sin espacios ni guiones) para pasaporte y otros.
 */
export const normalizeNationalId = (type: NationalIdType, raw: string): string => {
  const cleaned = ALPHANUMERIC_TYPES.includes(type)
    ? raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
    : raw.replace(/\D/g, "");
  return cleaned.slice(0, NATIONAL_ID_MAX_LENGTH[type]);
};

/** Mensaje de error del documento (vacío si es válido). Vacío no es error: es opcional. */
export const validateNationalId = (type: NationalIdType, value: string): string => {
  if (!value) return "";
  const { length } = value;
  if (type === "cedula") {
    return length >= 1 && length <= 9 ? "" : "La cédula debe tener entre 1 y 9 dígitos";
  }
  if (type === "dimex") {
    return length >= 11 && length <= 12 ? "" : "El DIMEX debe tener 11 o 12 dígitos";
  }
  if (type === "pasaporte") {
    return length >= 5 ? "" : "El pasaporte debe tener al menos 5 caracteres";
  }
  return length >= 3 ? "" : "El documento debe tener al menos 3 caracteres";
};

/** Cómo se muestra: la cédula con guiones (1-0234-0567), el resto tal cual. */
export const formatNationalId = (type: NationalIdType, value: string | null | undefined): string => {
  if (!value) return "";
  if (type !== "cedula") return value;
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits[0]}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
};

export const isNationalIdType = (value: unknown): value is NationalIdType =>
  typeof value === "string" && (NATIONAL_ID_TYPES as readonly string[]).includes(value);
