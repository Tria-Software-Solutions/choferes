// Email delivery for pay slips, backed by Resend (API key auth).
//
// The PDF is generated in the frontend (jsPDF) and sent as base64 so the exact
// document the user verified on screen is the one attached to the email.
import { Resend } from "resend";
import { ServiceError } from "../utils/errors";

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

const formatCurrency = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export interface PaymentSlipEmailInput {
  to: string;
  employeeName: string;
  biweekNumber: number;
  year: number;
  periodLabel: string; // e.g. "01/09/2026 – 15/09/2026"
  currency: string;
  regularSalary: number;
  hoursWorked?: number | null;
  hourlyRate?: number | null;
  overtimePay: number;
  mileage: number;
  others: number;
  socialCharges: number;
  deductions: number;
  totalPayable: number;
  pdfBase64?: string | null;
  pdfFileName?: string;
}

const row = (label: string, value: string): string => `
  <tr>
    <td style="padding:10px 14px;border-bottom:1px solid #ececef;font-size:14px;color:#3f3f46;">
      ${label}
    </td>
    <td style="padding:10px 14px;border-bottom:1px solid #ececef;font-size:14px;color:#18181b;text-align:right;font-weight:600;">
      ${value}
    </td>
  </tr>`;

const buildHtml = (input: PaymentSlipEmailInput): string => {
  const money = (value: number): string => formatCurrency(value, input.currency);
  const rateSuffix =
    input.hoursWorked != null && input.hourlyRate != null
      ? ` <span style="color:#71717a;font-weight:400;">(${input.hoursWorked} h × ${money(input.hourlyRate)})</span>`
      : "";

  return `
  <div style="margin:0;padding:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="background:#0a0a0a;padding:22px 24px;">
              <div style="font-size:11px;letter-spacing:0.18em;color:#9ca3af;text-transform:uppercase;">Choferes</div>
              <div style="font-size:20px;font-weight:700;color:#ffffff;margin-top:4px;">Boleta de pago</div>
              <div style="font-size:13px;color:#cbd5e1;margin-top:2px;">Quincena ${input.biweekNumber} de ${input.year} · ${input.periodLabel}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 8px 24px;">
              <div style="font-size:15px;color:#18181b;font-weight:600;">Hola ${input.employeeName},</div>
              <div style="font-size:14px;color:#52525b;margin-top:6px;line-height:1.5;">
                Adjuntamos la boleta de pago correspondiente a la quincena ${input.biweekNumber} de ${input.year}.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 4px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:10px;border-collapse:separate;overflow:hidden;">
                <tr style="background:#fafafa;">
                  <td colspan="2" style="padding:10px 14px;font-size:12px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #ececef;">
                    Concepto
                  </td>
                </tr>
                ${row(`Salario ordinario${rateSuffix}`, money(input.regularSalary))}
                ${row("Horas extra", money(input.overtimePay))}
                ${row("Millaje", money(input.mileage))}
                ${row("Otros ingresos", money(input.others))}
                ${row("Cargas sociales", money(input.socialCharges))}
                ${row("Deducciones", money(input.deductions))}
                <tr>
                  <td style="padding:14px;font-size:14px;font-weight:700;color:#ffffff;background:#0a0a0a;">
                    Total a pagar
                  </td>
                  <td style="padding:14px;font-size:16px;font-weight:700;color:#ffffff;background:#0a0a0a;text-align:right;">
                    ${money(input.totalPayable)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${
            input.pdfBase64
              ? `<tr><td style="padding:14px 24px 4px 24px;font-size:13px;color:#71717a;">
                  El detalle completo se encuentra en el archivo PDF adjunto.
                </td></tr>`
              : ""
          }
          <tr>
            <td style="padding:18px 24px 24px 24px;">
              <div style="font-size:12px;color:#a1a1aa;border-top:1px solid #ececef;padding-top:14px;line-height:1.6;">
                Este correo fue generado automáticamente por Choferes. Si tienes alguna pregunta sobre tu boleta,
                comunícate con Gerencia.
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
  const client = getClient();
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const subject = `Boleta de pago · Quincena ${input.biweekNumber} ${input.year} · ${input.employeeName}`;

  const attachments =
    input.pdfBase64 && input.pdfFileName
      ? [
          {
            filename: input.pdfFileName,
            content: input.pdfBase64,
          },
        ]
      : undefined;

  const { error } = await client.emails.send({
    from,
    to: [input.to],
    subject,
    html: buildHtml(input),
    attachments,
  });

  if (error) {
    throw new ServiceError(502, `No se pudo enviar el correo: ${error.message}`);
  }
};

// Exposed for tests: resets the cached client.
export const resetEmailClientForTests = (): void => {
  resendClient = null;
};
