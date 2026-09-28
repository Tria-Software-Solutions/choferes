// Email delivery for pay slips, backed by Resend (API key auth).
//
// The body reproduces the company's "Comprobante de pago" template (logos,
// title, period, concept table, currency note and legal footer). The PDF is
// generated in the frontend (jsPDF, same layout) and sent as base64 so the
// exact document the user verified on screen is the one attached.
import { Resend } from "resend";
import { ServiceError } from "../utils/errors";
import { BOLETA_LOGO_BRAND_PNG, BOLETA_LOGO_SHIELD_PNG } from "../assets/boletaLogos";
import { COMPANY, COMPANY_FOOTER_TEXT } from "../config/company";
import { formatBoletaPeriod, formatColones } from "../utils/boletaFormat";

let resendClient: Resend | null = null;

const getClient = (): Resend => {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new ServiceError(
      503,
      "Servicio de correo no configurado: falta RESEND_API_KEY en el entorno",
    );
  }
  resendClient = new Resend(apiKey);
  return resendClient;
};

export interface PaymentSlipEmailInput {
  to: string;
  employeeName: string;
  biweekNumber: number;
  year: number;
  /** Last day of the quincena (YYYY-MM-DD) — printed as "PERIODO". */
  periodEnd: string;
  currency: string;
  regularSalary: number;
  overtimePay: number;
  mileage: number;
  others: number;
  socialCharges: number;
  deductions: number;
  totalPayable: number;
  pdfBase64?: string | null;
  pdfFileName?: string;
}

// Employee names are free text entered in the app; escape them before they
// land in the HTML body so a crafted name can't inject markup or links.
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const CID_SHIELD = "boleta-logo-escudo";
const CID_BRAND = "boleta-logo-su-auto";

const FONT = "Arial,Helvetica,sans-serif";
const CELL = `border:1px solid #bfbfbf;padding:5px 8px;font-family:${FONT};font-size:13px;color:#242424;`;

const row = (label: string, value: string, strong = false): string => `
  <tr>
    <td style="${CELL}width:39%;font-weight:700;">${label}</td>
    <td style="${CELL}${strong ? "font-weight:700;" : ""}">${value}</td>
  </tr>`;

export const buildPaymentSlipHtml = (input: PaymentSlipEmailInput): string => {
  const period = formatBoletaPeriod(input.periodEnd);
  const firstName = escapeHtml(input.employeeName.split(" ")[0] || input.employeeName);

  return `
  <div style="margin:0;padding:0;background:#f4f4f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">
          <tr>
            <td style="padding:0 4px 12px 4px;font-family:${FONT};font-size:13px;color:#52525b;line-height:1.5;">
              Hola ${firstName}, este es tu comprobante de pago del periodo ${period}.
              ${input.pdfBase64 ? "También lo encontrarás en el PDF adjunto." : ""}
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #e4e4e7;border-radius:6px;padding:32px 40px 24px 40px;">
              <!-- Header: logos over a thick rule (as in the template) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:3px solid #000000;">
                <tr>
                  <td align="left" valign="bottom" style="padding-bottom:8px;">
                    <img src="cid:${CID_SHIELD}" width="92" alt="Choferes de Alquiler" style="display:block;width:92px;height:auto;border:0;" />
                  </td>
                  <td align="right" valign="bottom" style="padding-bottom:8px;">
                    <img src="cid:${CID_BRAND}" width="104" alt="Su auto... nuestro chofer." style="display:block;width:104px;height:auto;border:0;" />
                  </td>
                </tr>
              </table>

              <div style="text-align:center;font-family:${FONT};font-size:17px;font-weight:700;color:#242424;margin:28px 0 22px 0;">
                COMPROBANTE DE PAGO
              </div>

              <div style="font-family:${FONT};font-size:13px;color:#242424;margin-bottom:8px;">
                <strong>PERIODO:</strong> ${period}
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${row("Nombre", escapeHtml(input.employeeName))}
                ${row("Salario ordinario", formatColones(input.regularSalary))}
                ${row("Salario extraordinario", formatColones(input.overtimePay))}
                ${row("Kilometraje", formatColones(input.mileage))}
                ${row("Otros", formatColones(input.others))}
                ${row("Cargas Sociales", formatColones(input.socialCharges))}
                ${row("Rebajos", formatColones(input.deductions))}
                ${row("Total a pagar", formatColones(input.totalPayable), true)}
              </table>

              <div style="text-align:right;font-family:${FONT};font-size:12px;color:#242424;margin-top:6px;">
                *Moneda: Colón CR
              </div>

              <div style="margin-top:44px;padding-top:10px;border-top:1px solid #e4e4e7;text-align:center;font-family:Calibri,${FONT};font-size:11px;color:#242424;line-height:1.5;">
                ${COMPANY_FOOTER_TEXT} /
                <a href="${COMPANY.websiteUrl}" style="color:#1F497D;text-decoration:underline;">${COMPANY.website}</a>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>`;
};

/**
 * Sends a pay slip email with the boleta PDF attached (when provided).
 * Throws ServiceError(503) when unconfigured and ServiceError(502) when the
 * provider rejects the send.
 */
export const sendPaymentSlipEmail = async (input: PaymentSlipEmailInput): Promise<void> => {
  const from = resolveFrom();
  const client = getClient();

  const subject = `Comprobante de pago · ${formatBoletaPeriod(input.periodEnd)} · ${input.employeeName}`;

  const attachments: Array<{ filename: string; content: string; contentId?: string }> = [
    { filename: "logo-choferes.png", content: BOLETA_LOGO_SHIELD_PNG, contentId: CID_SHIELD },
    { filename: "logo-su-auto.png", content: BOLETA_LOGO_BRAND_PNG, contentId: CID_BRAND },
  ];
  if (input.pdfBase64 && input.pdfFileName) {
    attachments.push({ filename: input.pdfFileName, content: input.pdfBase64 });
  }

  const { error } = await client.emails.send({
    from,
    to: [input.to],
    subject,
    html: buildPaymentSlipHtml(input),
    attachments,
  });

  if (error) {
    throw new ServiceError(502, `No se pudo enviar el correo: ${error.message}`);
  }
};

// Resend's onboarding address only delivers to the account that owns the API
// key, so silently falling back to it in production makes every send fail with
// a 403 that looks like a provider outage. Fail fast instead, and keep the
// onboarding address only for local development.
const RESEND_TEST_FROM = "onboarding@resend.dev";

const resolveFrom = (): string => {
  const from = process.env.EMAIL_FROM;

  if (!from) {
    if (process.env.NODE_ENV === "production") {
      throw new ServiceError(
        503,
        "Servicio de correo no configurado: falta EMAIL_FROM en el entorno",
      );
    }
    return RESEND_TEST_FROM;
  }

  // Catches a common misconfiguration (a bare domain or a display name without
  // an address), which Resend rejects with an opaque 422.
  if (!from.includes("@")) {
    throw new ServiceError(
      503,
      `EMAIL_FROM inválido: se esperaba una dirección de correo y se recibió "${from}"`,
    );
  }

  return from;
};

// Exposed for tests: resets the cached client.
export const resetEmailClientForTests = (): void => {
  resendClient = null;
};
