import React, { useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
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
  IconFileText,
  IconInbox,
  IconPaperclip,
  IconShieldExclamation,
} from "@tabler/icons-react";
import type { DisciplinaryAttachment } from "@choferes/shared";
import {
  DISCIPLINARY_ACTION_TYPE_LABELS,
  type DisciplinaryAction,
} from "../../../models/DisciplinaryAction";
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

const SEVERITY: Record<string, { label: string; color: "default" | "warning" | "error" }> = {
  leve: { label: "Leve", color: "default" },
  grave: { label: "Grave", color: "warning" },
  muy_grave: { label: "Muy grave", color: "error" },
};

// YYYY-MM-DD → DD/MM/YYYY sin corrimiento de zona horaria.
const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

// Descarga un adjunto guardado como data URL base64. Se rechaza cualquier otra
// cosa: una URL `javascript:` ejecutaría código en la sesión que la abre.
const downloadAttachment = (attachment: DisciplinaryAttachment) => {
  if (!/^data:[\w.+-]+\/[\w.+-]+;base64,/.test(attachment.dataUrl ?? "")) return;
  const link = document.createElement("a");
  link.href = attachment.dataUrl;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface DisciplinaryTabProps {
  overview: LinkedOverview;
}

// "Amonestaciones": las llamadas de atención registradas en el expediente,
// con la misma tarjeta y tabla que la pestaña de gerencia.
export const DisciplinaryTab: React.FC<DisciplinaryTabProps> = ({ overview }) => {
  const theme = useTheme();
  const actions = useMemo(
    () => [...overview.disciplinaryActions].sort((a, b) => (a.actionDate < b.actionDate ? 1 : -1)),
    [overview.disciplinaryActions],
  );

  return (
    <Box sx={cardStackStyles}>
      <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
        <SectionHeader
          icon={<IconShieldExclamation size={20} stroke={1.5} />}
          title="Llamadas de atención y amonestaciones"
          description="Registro disciplinario con sus adjuntos."
          actions={
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}
            >
              <IconShieldExclamation size={16} color={theme.palette.primary.main} />
              {actions.length} registro{actions.length === 1 ? "" : "s"}
            </Typography>
          }
        />

        {actions.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">No hay amonestaciones registradas</Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <ResponsiveTable size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyles(theme)}>Fecha</TableCell>
                  <TableCell sx={tableHeaderCellStyles(theme)}>Tipo</TableCell>
                  <TableCell sx={tableHeaderCellStyles(theme)}>Gravedad</TableCell>
                  <TableCell sx={tableHeaderCellStyles(theme)}>Motivo</TableCell>
                  <TableCell sx={tableHeaderCellStyles(theme)} align="center">
                    Adjuntos
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions.map((action: DisciplinaryAction) => {
                  const severity = SEVERITY[action.severity] ?? SEVERITY.leve;
                  const attachments = Array.isArray(action.attachments) ? action.attachments : [];
                  return (
                    <TableRow key={action.id} hover>
                      <TableCell sx={tableCellStyles(theme)}>{formatDate(action.actionDate)}</TableCell>
                      <TableCell sx={tableCellStyles(theme)}>
                        {DISCIPLINARY_ACTION_TYPE_LABELS[
                          action.type as keyof typeof DISCIPLINARY_ACTION_TYPE_LABELS
                        ] ?? action.type}
                      </TableCell>
                      <TableCell sx={tableCellStyles(theme)}>
                        <Chip
                          size="small"
                          label={severity.label}
                          color={severity.color}
                          variant={severity.color === "default" ? "outlined" : "filled"}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles(theme)}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {action.reason}
                        </Typography>
                        {action.description && (
                          <Typography
                            variant="caption"
                            title={action.description}
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              maxWidth: 280,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {action.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={tableCellStyles(theme)} align="center">
                        {attachments.length === 0 ? (
                          "—"
                        ) : (
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.25 }}>
                            {attachments.map((attachment, index) => (
                              <IconButton
                                key={`${attachment.name}-${index}`}
                                size="small"
                                title={`Descargar ${attachment.name}`}
                                onClick={() => downloadAttachment(attachment)}
                              >
                                {attachment.mimeType?.startsWith("image/") ? (
                                  <IconPaperclip size={15} />
                                ) : (
                                  <IconFileText size={15} />
                                )}
                              </IconButton>
                            ))}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </ResponsiveTable>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default DisciplinaryTab;
