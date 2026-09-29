import React, { useMemo, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { IconEye, IconReceipt, IconTimeline, IconHistory } from "@tabler/icons-react";
import { StatusBadge } from "../../../components/Layout";
import { BentoGridItem } from "../../../components/BentoGrid/BentoGrid.component";
import type { Payment } from "../../../models/Payment";
import { formatColones } from "../../../utils/boletaFormat";
import PaymentBoletaDialog, { PAYMENT_STATUS } from "../../EmployeeDetail/components/PaymentBoletaDialog";
import {
  biweekLabel,
  formatShortDate,
  latestPayment,
  sortPaymentsDesc,
  trimZeroCents,
  type LinkedOverview,
} from "../panelModel";
import { fillGridSx, span, stackSx, tabRootSx } from "../ui/layout";
import { revealSx, useCountUp } from "../ui/motion";
import { PaymentsChart } from "./PanelCharts";
import { EmptyHint, GhostButton, ListRow, RowStack, RowText, SoftIcon } from "./panelParts";

const money = (value: number): string => trimZeroCents(formatColones(value));

interface LineItem {
  label: string;
  amount: number;
  sign: "+" | "−";
}

const lineItems = (payment: Payment): LineItem[] =>
  (
    [
      { label: "Salario regular", amount: Number(payment.regularSalary) || 0, sign: "+" },
      { label: "Horas extra", amount: Number(payment.overtimePay) || 0, sign: "+" },
      { label: "Kilometraje", amount: Number(payment.mileage) || 0, sign: "+" },
      { label: "Otros", amount: Number(payment.others) || 0, sign: "+" },
      { label: "Cargas sociales", amount: Number(payment.socialCharges) || 0, sign: "−" },
      { label: "Deducciones", amount: Number(payment.deductions) || 0, sign: "−" },
    ] as LineItem[]
  ).filter((item) => item.amount !== 0);

const FeaturedPayment: React.FC<{ payment: Payment; onView: (payment: Payment) => void }> = ({ payment, onView }) => {
  const { colors, borders } = useTheme().tokens;
  const status = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.pending;
  const total = Number(payment.totalPayable) || 0;
  const animated = useCountUp(total);
  const items = lineItems(payment);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: colors.textMuted,
            }}
          >
            Quincena {biweekLabel(payment.biweekNumber, payment.year)}
          </Typography>
          <StatusBadge label={status.label} tone={status.tone} size="small" />
        </Box>
        <Typography
          component="div"
          sx={{ mt: 0.75, fontSize: { xs: "2.25rem", md: "2.75rem" }, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: colors.text }}
        >
          {money(Math.round(animated * 100) / 100)}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: "0.8125rem", color: colors.textMuted }}>
          {payment.payDate ? `Fecha de pago: ${formatShortDate(payment.payDate)}` : "Fecha de pago por definir"}
        </Typography>
      </Box>

      {items.length > 0 && (
        <Box sx={{ borderTop: borders.hairline, pt: 1.5, display: "flex", flexDirection: "column", gap: 0.9 }}>
          {items.map((item) => (
            <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography sx={{ fontSize: "0.8125rem", color: colors.textMuted }}>{item.label}</Typography>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.text }}>
                {item.sign === "−" ? "−" : ""}
                {money(item.amount)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Button variant="contained" fullWidth startIcon={<IconEye size={18} />} onClick={() => onView(payment)}>
        Ver boleta
      </Button>
    </Box>
  );
};

interface PaymentsTabProps {
  overview: LinkedOverview;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ overview }) => {
  const { colors } = useTheme().tokens;
  const [selected, setSelected] = useState<Payment | null>(null);

  const ordered = useMemo(() => sortPaymentsDesc(overview.payments), [overview.payments]);
  const latest = latestPayment(overview.payments);

  if (ordered.length === 0) {
    return (
      <Box sx={tabRootSx}>
        <BentoGridItem
          icon={<IconReceipt />}
          title="Mis pagos"
          description="Boletas quincenales"
          header={
            <EmptyHint
              icon={<IconReceipt />}
              title="Todavía no tienes boletas"
              description="Cuando se genere tu primera boleta quincenal aparecerá aquí."
            />
          }
          sx={{ flex: 1, ...(revealSx(0) as object) }}
        />
      </Box>
    );
  }

  return (
    <Box sx={tabRootSx}>
      <Box sx={fillGridSx}>
        <Box sx={{ ...(stackSx as object), ...span(5) }}>
          {latest && (
            <BentoGridItem
              icon={<IconReceipt />}
              title="Última boleta"
              description="Tu pago más reciente"
              header={<FeaturedPayment payment={latest} onView={setSelected} />}
              sx={revealSx(0) as object}
            />
          )}
          <BentoGridItem
            icon={<IconTimeline />}
            title="Evolución de pagos"
            description="Importe de tus últimas boletas"
            header={<PaymentsChart payments={ordered} />}
            sx={{ flex: 1, ...(revealSx(1) as object) }}
          />
        </Box>

        <BentoGridItem
          icon={<IconHistory />}
          title="Historial de boletas"
          description={`${ordered.length} ${ordered.length === 1 ? "boleta" : "boletas"}`}
          header={
            // En pantallas anchas la lista se desplaza dentro de la tarjeta para no
            // alargar la página: la altura máxima sigue a la de la ventana.
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                maxHeight: { md: "calc(100dvh - 300px)" },
                pr: 0.5,
                mr: -0.5,
              }}
            >
              <RowStack>
                {ordered.map((payment) => {
                  const status = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.pending;
                  return (
                    <ListRow key={payment.id}>
                      <SoftIcon tone={status.tone === "default" ? "default" : status.tone}>
                        <IconReceipt />
                      </SoftIcon>
                      <RowText
                        title={biweekLabel(payment.biweekNumber, payment.year)}
                        subtitle={payment.payDate ? `Pago: ${formatShortDate(payment.payDate)}` : "Fecha de pago por definir"}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.9375rem",
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                          color: colors.text,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {money(Number(payment.totalPayable) || 0)}
                      </Typography>
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        <StatusBadge label={status.label} tone={status.tone} size="small" />
                      </Box>
                      <GhostButton
                        startIcon={<IconEye size={16} />}
                        onClick={() => setSelected(payment)}
                        sx={{ minWidth: "auto" }}
                      >
                        Ver
                      </GhostButton>
                    </ListRow>
                  );
                })}
              </RowStack>
            </Box>
          }
          sx={{ ...span(7), ...(revealSx(2) as object) }}
        />
      </Box>

      <PaymentBoletaDialog open={Boolean(selected)} onClose={() => setSelected(null)} payment={selected} />
    </Box>
  );
};
