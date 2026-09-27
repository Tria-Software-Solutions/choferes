import React from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import shieldLogo from "../../assets/images/boleta/logo-escudo.png";
import brandLogo from "../../assets/images/boleta/logo-su-auto.png";
import { PAYMENT_CONCEPTS, PaymentAmountField, PaymentAmounts } from "../../models/Payment";
import {
  COMPANY,
  COMPANY_FOOTER_TEXT,
  formatBoletaPeriod,
  formatColones,
} from "../../utils/boletaFormat";

interface BoletaDocumentProps {
  employeeName: string;
  /** Last day of the quincena (YYYY-MM-DD), printed as "PERIODO". */
  periodEnd: string;
  amounts: PaymentAmounts;
  total: number;
  /** Replaces the value cell of an amount (e.g. an input while editing). */
  renderAmount?: (field: PaymentAmountField) => React.ReactNode;
  sx?: SxProps<Theme>;
}

// Paper colors are fixed on purpose: the preview must look exactly like the
// printed/emailed "Comprobante de pago" in light and dark mode alike.
const INK = "#242424";
const GRID = "1px solid #bfbfbf";
const FONT = "Arial, Helvetica, sans-serif";

const cellSx = {
  border: GRID,
  px: 1,
  py: 0.6,
  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
  lineHeight: 1.35,
  verticalAlign: "middle",
} as const;

// On-screen replica of the company's "Comprobante de pago" template (same
// layout as the PDF in utils/paymentSlipPdf.ts and the email body).
export const BoletaDocument: React.FC<BoletaDocumentProps> = ({
  employeeName,
  periodEnd,
  amounts,
  total,
  renderAmount,
  sx,
}) => (
  <Box
    sx={[
      {
        backgroundColor: "#ffffff",
        color: INK,
        fontFamily: FONT,
        borderRadius: "6px",
        border: "1px solid rgba(9,9,11,0.1)",
        boxShadow: "0 1px 2px rgba(16,24,40,0.06), 0 8px 24px -12px rgba(16,24,40,0.18)",
        px: { xs: 2, sm: 4 },
        pt: { xs: 2, sm: 3 },
        pb: 2,
      },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        borderBottom: "3px solid #000",
        pb: 1,
      }}
    >
      <Box
        component="img"
        src={shieldLogo}
        alt="Choferes de Alquiler"
        sx={{ width: { xs: 64, sm: 84 }, height: "auto", display: "block" }}
      />
      <Box
        component="img"
        src={brandLogo}
        alt="Su auto… nuestro chofer."
        sx={{ width: { xs: 72, sm: 92 }, height: "auto", display: "block" }}
      />
    </Box>

    <Box
      sx={{
        textAlign: "center",
        fontWeight: 700,
        fontSize: { xs: "0.95rem", sm: "1.05rem" },
        letterSpacing: "0.01em",
        mt: { xs: 2, sm: 2.75 },
        mb: { xs: 1.75, sm: 2.25 },
      }}
    >
      COMPROBANTE DE PAGO
    </Box>

    <Box sx={{ fontSize: "0.8125rem", mb: 0.75 }}>
      <Box component="span" sx={{ fontWeight: 700 }}>
        PERIODO:
      </Box>{" "}
      {formatBoletaPeriod(periodEnd)}
    </Box>

    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <Box component="colgroup">
        <Box component="col" sx={{ width: "39%" }} />
        <Box component="col" />
      </Box>
      <tbody>
        <tr>
          <Box component="th" scope="row" sx={{ ...cellSx, fontWeight: 700, textAlign: "left" }}>
            Nombre
          </Box>
          <Box component="td" sx={cellSx}>
            {employeeName}
          </Box>
        </tr>
        {PAYMENT_CONCEPTS.map(({ field, label }) => (
          <tr key={field}>
            <Box component="th" scope="row" sx={{ ...cellSx, fontWeight: 700, textAlign: "left" }}>
              {label}
            </Box>
            <Box component="td" sx={{ ...cellSx, ...(renderAmount && { py: 0.25 }) }}>
              {renderAmount ? renderAmount(field) : formatColones(amounts[field])}
            </Box>
          </tr>
        ))}
        <tr>
          <Box component="th" scope="row" sx={{ ...cellSx, fontWeight: 700, textAlign: "left" }}>
            Total a pagar
          </Box>
          <Box component="td" sx={{ ...cellSx, fontWeight: 700 }}>
            {formatColones(total)}
          </Box>
        </tr>
      </tbody>
    </Box>

    <Box sx={{ textAlign: "right", fontSize: "0.75rem", mt: 0.5 }}>*Moneda: Colón CR</Box>

    <Box
      sx={{
        mt: { xs: 3, sm: 5 },
        pt: 1,
        borderTop: "1px solid #ececef",
        textAlign: "center",
        fontSize: "0.6875rem",
        lineHeight: 1.5,
        fontFamily: `Calibri, ${FONT}`,
      }}
    >
      {COMPANY_FOOTER_TEXT} /{" "}
      <Box
        component="a"
        href={COMPANY.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: "#1F497D", textDecoration: "underline" }}
      >
        {COMPANY.website}
      </Box>
    </Box>
  </Box>
);

export default BoletaDocument;
