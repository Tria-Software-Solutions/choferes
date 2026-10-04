import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import ResponsiveTable from "../../../components/Table/ResponsiveTable/ResponsiveTable.component";
import {
  IconAlertTriangle,
  IconClock,
  IconId,
  IconInbox,
  IconPencil,
  IconPlus,
} from "@tabler/icons-react";
import type { EmployeeLicense } from "../../../models/EmployeeLicense";
import type { LicenseRequest } from "../../../models/LicenseRequest";
import { useAuthContext } from "../../../context/AuthContext";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import type { LinkedOverview } from "../panelModel";
import {
  cardStackStyles,
  emptyStateBoxStyles,
  fillSectionPaperStyles,
  tableCellStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
} from "../../EmployeeDetail/styles";
import SectionHeader from "../../EmployeeDetail/components/SectionHeader";
import { submitButton } from "../../Forms/sharedStyles";
import MyLicenseRequestDialog from "./MyLicenseRequestDialog";

type LicenseStatusKey = "vigente" | "por_vencer" | "vencida" | "sin_vencimiento";

const STATUS: Record<LicenseStatusKey, { label: string; color: "success" | "warning" | "error" | "default" }> = {
  vigente: { label: "Vigente", color: "success" },
  por_vencer: { label: "Por vencer", color: "warning" },
  vencida: { label: "Vencida", color: "error" },
  sin_vencimiento: { label: "Sin vencimiento", color: "default" },
};

// YYYY-MM-DD → DD/MM/YYYY sin corrimiento de zona horaria.
const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

const describeRequest = (request: LicenseRequest): string => {
  const type = request.payload?.licenseType ?? request.license?.licenseType ?? "";
  if (request.action === "create") return `Nueva licencia ${type}`.trim();
  if (request.action === "update") return `Cambio de la licencia ${type}`.trim();
  return `Eliminar la licencia ${type}`.trim();
};

interface LicensesTabProps {
  overview: LinkedOverview;
  /** Recarga el panel tras enviar una solicitud. */
  onRefresh: () => Promise<void> | void;
}

// "Licencias": las del empleado con su vencimiento y las solicitudes que él
// mismo envía. Mismo formato de tarjeta y tabla que la pestaña de licencias del
// expediente de gerencia, pero en modo consulta/solicitud.
export const LicensesTab: React.FC<LicensesTabProps> = ({ overview, onRefresh }) => {
  const { licenses } = overview;
  // Defensivo: un panel cacheado de una versión anterior puede no traerlas.
  const licenseRequests = overview.licenseRequests ?? [];
  const theme = useTheme();
  const { userPermissions } = useAuthContext();
  const canRequest = userPermissions.includes(PERMISSION_CODES.VIEW_MY_PANEL);

  const [dialog, setDialog] = useState<{ open: boolean; license: EmployeeLicense | null }>({
    open: false,
    license: null,
  });

  const pendingRequests = licenseRequests.filter((request) => request.status === "pending");
  const pendingByLicense = new Map<number, LicenseRequest>();
  pendingRequests
    .filter((request) => request.licenseId != null)
    .forEach((request) => pendingByLicense.set(request.licenseId as number, request));
  const alerts = licenses.filter(
    (license) => license.status === "vencida" || license.status === "por_vencer",
  );

  const openDialog = (license: EmployeeLicense | null) => setDialog({ open: true, license });

  return (
    <>
      <Box sx={cardStackStyles}>
        <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
          <SectionHeader
            icon={<IconId size={20} stroke={1.5} />}
            title="Licencias de conducir"
            description="Tus licencias y su fecha de vencimiento."
            actions={
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
                >
                  <IconId size={16} color={theme.palette.primary.main} />
                  {licenses.length} licencia{licenses.length === 1 ? "" : "s"}
                </Typography>
                {canRequest && (
                  <Button
                    variant="text"
                    startIcon={<IconPlus size={18} />}
                    onClick={() => openDialog(null)}
                    sx={submitButton}
                  >
                    Solicitar licencia
                  </Button>
                )}
              </Box>
            }
          />

          {/* Solicitudes enviadas por el empleado: quedan en revisión hasta que
              administración las resuelve. */}
          {pendingRequests.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
              {pendingRequests.map((request) => (
                <Box
                  key={request.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: "12px",
                    border: `1px solid ${theme.tokens.colors.warning}55`,
                    backgroundColor: theme.tokens.colors.warningSoft,
                  }}
                >
                  <IconClock size={18} style={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                      {describeRequest(request)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      En revisión desde el {formatDate(request.createdAt?.slice(0, 10))}
                    </Typography>
                  </Box>
                  <Chip size="small" color="warning" label="En revisión" />
                </Box>
              ))}
            </Box>
          )}

          {alerts.length > 0 && (
            <Alert
              severity={alerts.some((license) => license.status === "vencida") ? "error" : "warning"}
              icon={<IconAlertTriangle size={18} />}
              sx={{ mb: 1.5, borderRadius: "10px" }}
            >
              {alerts.length} licencia{alerts.length === 1 ? "" : "s"} vencida
              {alerts.length === 1 ? "" : "s"} o por vencer en los próximos 30 días.
            </Alert>
          )}

          {licenses.length === 0 ? (
            <Box sx={emptyStateBoxStyles(theme)}>
              <IconInbox size={34} />
              <Typography variant="body2">No hay licencias registradas</Typography>
              {canRequest && (
                <Typography variant="caption" sx={{ color: theme.tokens.colors.textMuted }}>
                  Solicita tu licencia y administración la revisa.
                </Typography>
              )}
            </Box>
          ) : (
            <TableContainer sx={tableContainerStyles(theme)}>
              <ResponsiveTable size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCellStyles(theme)}>Tipo</TableCell>
                    <TableCell sx={tableHeaderCellStyles(theme)}>Número</TableCell>
                    <TableCell sx={tableHeaderCellStyles(theme)}>Expedición</TableCell>
                    <TableCell sx={tableHeaderCellStyles(theme)}>Vencimiento</TableCell>
                    <TableCell sx={tableHeaderCellStyles(theme)}>Estado</TableCell>
                    {canRequest && (
                      <TableCell sx={tableHeaderCellStyles(theme)} align="right">
                        Acciones
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licenses.map((license) => {
                    const status = STATUS[(license.status ?? "sin_vencimiento") as LicenseStatusKey];
                    const pending = pendingByLicense.get(license.id);
                    return (
                      <TableRow key={license.id} hover>
                        <TableCell sx={[tableCellStyles(theme), { fontWeight: 700 }]}>
                          {license.licenseType}
                        </TableCell>
                        <TableCell sx={tableCellStyles(theme)}>
                          {license.licenseNumber || "—"}
                        </TableCell>
                        <TableCell sx={tableCellStyles(theme)}>
                          {formatDate(license.issuedAt)}
                        </TableCell>
                        <TableCell sx={tableCellStyles(theme)}>
                          {formatDate(license.expiresAt)}
                          {license.daysUntilExpiry != null && license.daysUntilExpiry >= 0 && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ color: "text.secondary", ml: 0.75 }}
                            >
                              ({license.daysUntilExpiry} d)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={tableCellStyles(theme)}>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}
                          >
                            <Chip size="small" label={status.label} color={status.color} variant="outlined" />
                            {pending && (
                              <Chip
                                size="small"
                                color="warning"
                                label={pending.action === "delete" ? "Baja en revisión" : "Cambio en revisión"}
                              />
                            )}
                          </Box>
                        </TableCell>
                        {canRequest && (
                          <TableCell sx={tableCellStyles(theme)} align="right">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<IconPencil size={15} />}
                              onClick={() => openDialog(license)}
                              aria-label={`Solicitar cambio de la licencia ${license.licenseType}`}
                              sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                              Editar
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </ResponsiveTable>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {canRequest && dialog.open && (
        <MyLicenseRequestDialog
          open
          license={dialog.license}
          onClose={() => setDialog({ open: false, license: null })}
          onRequested={onRefresh}
        />
      )}
    </>
  );
};

export default LicensesTab;
