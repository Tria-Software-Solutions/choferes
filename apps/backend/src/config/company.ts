// Company identity printed on official documents (pay slips). Mirrors the
// footer of the "Comprobante de pago" Word template.
export const COMPANY = {
  legalName: "Choferes de Alquiler, S.A.",
  legalId: "Cédula Jurídica 3-101-559864",
  phone: "Teléfono 2234·2662",
  tollFree: "800·CHOFERES",
  website: "www.choferesdealquiler.com",
  websiteUrl: "http://www.choferesdealquiler.com",
} as const;

export const COMPANY_FOOTER_TEXT = [
  COMPANY.legalName,
  COMPANY.legalId,
  COMPANY.phone,
  COMPANY.tollFree,
].join(" / ");
