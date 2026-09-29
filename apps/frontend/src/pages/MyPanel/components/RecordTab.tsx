import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  IconBriefcase,
  IconCalendarEvent,
  IconHourglass,
  IconId,
  IconMail,
  IconPhone,
  IconShieldCheck,
  IconShieldExclamation,
  IconUser,
  IconWallet,
} from "@tabler/icons-react";
import { StatusBadge } from "../../../components/Layout";
import type { StatTone } from "../../../components/Layout";
import { BentoGridItem } from "../../../components/BentoGrid/BentoGrid.component";
import { getEmployeePositionLabel } from "../../../models/Employee";
import {
  DISCIPLINARY_ACTION_TYPE_LABELS,
  DISCIPLINARY_SEVERITY_LABELS,
} from "../../../models/DisciplinaryAction";
import type { DisciplinaryAction } from "../../../models/DisciplinaryAction";
import type { EmployeeLicense, LicenseStatus } from "../../../models/EmployeeLicense";
import { maskNationalId, maskPhone } from "../../../utils/mask";
import { formatMoney } from "../../../utils/paymentSlipPdf";
import { formatTenure } from "../../../utils/tenure";
import { formatDaysCount, formatShortDate, type LinkedOverview } from "../panelModel";
import { MeterBar, type MeterTone } from "../ui/Meter";
import { fillGridSx, span, stackSx, tabRootSx } from "../ui/layout";
import { revealSx } from "../ui/motion";
import { EmptyHint, Field, ListRow, RowStack, formatDay } from "./panelParts";

// ─── Licencias ──────────────────────────────────────────────────────────────

const LICENSE_STATUS: Record<LicenseStatus, { label: string; tone: StatTone; meter: MeterTone }> = {
  vigente: { label: "Vigente", tone: "success", meter: "success" },
  por_vencer: { label: "Por vencer", tone: "warning", meter: "warning" },
  vencida: { label: "Vencida", tone: "danger", meter: "danger" },
  sin_vencimiento: { label: "Sin vencimiento", tone: "default", meter: "accent" },
};

const describeValidity = (license: EmployeeLicense): string => {
  if (!license.expiresAt) return "Sin fecha de vencimiento";
  const days = license.daysUntilExpiry;
  const date = formatDay(license.expiresAt);
  if (days == null) return `Vence el ${date}`;
  if (days < 0) return `Venció el ${date} · hace ${formatDaysCount(-days)}`;
  if (days === 0) return `Vence hoy · ${date}`;
  return `Vence el ${date} · en ${formatDaysCount(days)}`;
};

const LicenseCard: React.FC<{ license: EmployeeLicense }> = ({ license }) => {
  const { colors } = useTheme().tokens;
  const status = LICENSE_STATUS[license.status ?? "sin_vencimiento"] ?? LICENSE_STATUS.sin_vencimiento;
  const toneColors = {
    success: colors.successSoft,
    warning: colors.warningSoft,
    danger: colors.errorSoft,
    default: colors.accentSoft,
    accent: colors.accentSoft,
    info: colors.infoSoft,
  }[status.tone];
  const days = license.daysUntilExpiry;
  const showMeter = Boolean(license.expiresAt) && days != null;

  return (
    <ListRow sx={{ alignItems: "flex-start", p: 1.5 }}>
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          minWidth: 52,
          height: 52,
          px: 1,
          borderRadius: "14px",
          display: "grid",
          placeItems: "center",
          backgroundColor: toneColors,
          color: colors.text,
          fontSize: "1.125rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        {license.licenseType}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: colors.text }}>
            Licencia {license.licenseType}
          </Typography>
          <StatusBadge label={status.label} tone={status.tone} size="small" />
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: colors.textMuted }}>
          {license.licenseNumber ? `N.º ${license.licenseNumber}` : "Sin número registrado"}
        </Typography>
        {showMeter && (
          <MeterBar
            sx={{ mt: 1 }}
            value={Math.max(0, days ?? 0)}
            max={365}
            tone={status.meter}
            height={5}
            label={`Vigencia restante de la licencia ${license.licenseType}`}
          />
        )}
        <Typography sx={{ mt: 0.75, fontSize: "0.75rem", fontWeight: 600, color: colors.textMuted }}>
          {describeValidity(license)}
        </Typography>
      </Box>
    </ListRow>
  );
};

// ─── Amonestaciones ─────────────────────────────────────────────────────────

const SEVERITY_TONE: Record<string, StatTone> = { leve: "info", grave: "warning", muy_grave: "danger" };

const Timeline: React.FC<{ actions: DisciplinaryAction[] }> = ({ actions }) => {
  const { colors } = useTheme().tokens;
  const toneOf = (severity: string): StatTone => SEVERITY_TONE[severity] ?? "default";
  const dotColor = (tone: StatTone): string =>
    ({
      danger: colors.error,
      warning: colors.warning,
      info: colors.info,
      success: colors.success,
      accent: colors.accent,
      default: colors.textSubtle,
    })[tone];

  const ordered = [...actions].sort((a, b) => (a.actionDate < b.actionDate ? 1 : -1));

  return (
    <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column" }}>
      {ordered.map((action, index) => {
        const tone = toneOf(action.severity);
        const typeLabel =
          DISCIPLINARY_ACTION_TYPE_LABELS[action.type as keyof typeof DISCIPLINARY_ACTION_TYPE_LABELS] ?? action.type;
        const severityLabel =
          DISCIPLINARY_SEVERITY_LABELS[action.severity as keyof typeof DISCIPLINARY_SEVERITY_LABELS] ?? action.severity;
        const isLast = index === ordered.length - 1;
        return (
          <Box
            component="li"
            key={action.id}
            sx={{
              position: "relative",
              pl: 3.25,
              pb: isLast ? 0 : 2,
              "&::before": isLast
                ? undefined
                : {
                    content: '""',
                    position: "absolute",
                    left: 4.5,
                    top: 14,
                    bottom: -2,
                    width: 1.5,
                    backgroundColor: colors.borderStrong,
                  },
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                left: 0,
                top: 5,
                width: 11,
                height: 11,
                borderRadius: "50%",
                backgroundColor: dotColor(tone),
                boxShadow: `0 0 0 3px ${colors.surface}`,
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: colors.text }}>{typeLabel}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: colors.textMuted, whiteSpace: "nowrap" }}>
                {formatShortDate(action.actionDate)}
              </Typography>
            </Box>
            <Typography sx={{ mt: 0.25, fontSize: "0.8125rem", color: colors.textMuted, lineHeight: 1.5 }}>
              {action.reason}
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              <StatusBadge label={severityLabel} tone={tone} size="small" />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─── Pestaña ────────────────────────────────────────────────────────────────

interface RecordTabProps {
  overview: LinkedOverview;
}

export const RecordTab: React.FC<RecordTabProps> = ({ overview }) => {
  const { employee, licenses, disciplinaryActions } = overview;
  const { colors } = useTheme().tokens;

  const position = getEmployeePositionLabel(employee.position, employee.gender);
  const phones = [employee.primaryPhone, employee.secondaryPhone]
    .filter(Boolean)
    .map((phone) => maskPhone(phone as string))
    .join(" · ");

  return (
    <Box sx={tabRootSx}>
      <Box sx={fillGridSx}>
        <BentoGridItem
          icon={<IconUser />}
          title="Datos personales"
          description="Lo que administración tiene registrado sobre ti"
          header={
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {/* Los datos se reparten el alto de la tarjeta: sin huecos abajo. */}
              <Box
                sx={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr)",
                  gridAutoRows: "minmax(48px, 1fr)",
                  alignItems: "center",
                }}
              >
                <Field icon={<IconBriefcase />} label="Puesto" value={position ?? "—"} />
                <Field icon={<IconMail />} label="Correo" value={employee.email || "—"} />
                <Field
                  icon={<IconId />}
                  label="Cédula"
                  value={employee.nationalId ? maskNationalId(employee.nationalId) : "—"}
                />
                <Field icon={<IconPhone />} label="Teléfonos" value={phones || "—"} />
                <Field
                  icon={<IconCalendarEvent />}
                  label="Fecha de ingreso"
                  value={formatDay(employee.contractStartDate)}
                />
                <Field icon={<IconHourglass />} label="Antigüedad" value={formatTenure(employee.contractStartDate) ?? "—"} />
                <Field
                  icon={<IconWallet />}
                  label="Tarifa por hora"
                  value={employee.hourlyRate != null ? formatMoney(Number(employee.hourlyRate), "CRC") : "—"}
                />
              </Box>
              {employee.terminationDate && (
                <Typography sx={{ mt: 1.5, fontSize: "0.75rem", color: colors.textMuted }}>
                  Fecha de finalización de labores: {formatDay(employee.terminationDate)}
                </Typography>
              )}
            </Box>
          }
          sx={{ ...span(5), ...(revealSx(0) as object) }}
        />

        <Box sx={{ ...(stackSx as object), ...span(7) }}>
          <BentoGridItem
            icon={<IconId />}
            title="Licencias de conducir"
            description="Categorías y vencimientos"
            header={
              licenses.length === 0 ? (
                <EmptyHint
                  icon={<IconId />}
                  title="Sin licencias registradas"
                  description="Si tienes una licencia vigente, pide a administración que la registre."
                />
              ) : (
                <RowStack>
                  {licenses.map((license) => (
                    <LicenseCard key={license.id} license={license} />
                  ))}
                </RowStack>
              )
            }
            sx={revealSx(1) as object}
          />
          <BentoGridItem
            icon={<IconShieldExclamation />}
            title="Amonestaciones"
            description="Llamadas de atención registradas"
            header={
              disciplinaryActions.length === 0 ? (
                <EmptyHint
                  icon={<IconShieldCheck />}
                  tone="success"
                  title="Sin amonestaciones"
                  description="Tu expediente está limpio. ¡Buen trabajo!"
                />
              ) : (
                <Timeline actions={disciplinaryActions} />
              )
            }
            sx={{ flex: 1, ...(revealSx(2) as object) }}
          />
        </Box>
      </Box>
    </Box>
  );
};
