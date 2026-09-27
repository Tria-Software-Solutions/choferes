import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconCheck, IconCopy, IconInfoCircle, IconKey, IconX } from "@tabler/icons-react";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";

interface TempPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  /** Nombre completo del empleado, solo para el texto introductorio. */
  employeeName: string;
  /** Usuario con el que inicia sesión (normalmente su email). */
  username?: string;
  /** Contraseña temporal en texto plano: solo llega aquí una vez. */
  tempPassword?: string;
}

// Fila de credencial con su botón de copiado (usuario / contraseña).
const CredentialRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin permiso de portapapeles: el valor queda visible para copiarlo a mano.
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        px: 1.75,
        py: 1.25,
        borderRadius: "10px",
        backgroundColor: theme.tokens.colors.hover,
        border: `1px solid ${theme.tokens.colors.border}`,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.7rem", color: theme.tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: "0.95rem",
            wordBreak: "break-all",
          }}
        >
          {value}
        </Typography>
      </Box>
      <PremiumTooltip title={copied ? "¡Copiado!" : "Copiar"}>
        <IconButton size="small" onClick={() => void handleCopy()} aria-label={`Copiar ${label}`}>
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </IconButton>
      </PremiumTooltip>
    </Box>
  );
};

// Diálogo de credenciales temporales. Se muestra solo cuando el backend crea la
// cuenta: la contraseña no vuelve a estar disponible después, así que hay que
// entregarla antes de cerrar.
const TempPasswordDialog: React.FC<TempPasswordDialogProps> = ({
  open,
  onClose,
  employeeName,
  username,
  tempPassword,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    const lines = [
      `Acceso al sistema — ${employeeName}`,
      username ? `Usuario: ${username}` : null,
      tempPassword ? `Contraseña temporal: ${tempPassword}` : null,
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      // Ignorado: las credenciales siguen visibles en pantalla.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 0,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: { xs: 2.5, sm: 3.5 } }}>
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: "12px",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconKey size={18} color={theme.palette.primary.contrastText} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Acceso al sistema activado
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: "0.85rem", color: theme.tokens.colors.textMuted }}>
              {employeeName} ya puede iniciar sesión.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Cerrar" sx={{ mt: -0.5, mr: -1 }}>
            <IconX size={18} />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 2.5, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <CredentialRow label="Usuario" value={username || "—"} />
          <CredentialRow label="Contraseña temporal" value={tempPassword || "—"} />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            mt: 2,
            p: 1.5,
            borderRadius: "10px",
            backgroundColor: theme.tokens.colors.hoverSoft,
            border: `1px solid ${theme.tokens.colors.border}`,
          }}
        >
          <IconInfoCircle size={16} style={{ flexShrink: 0, marginTop: 1, opacity: 0.6 }} />
          <Typography sx={{ fontSize: "0.8rem", color: theme.tokens.colors.textMuted, lineHeight: 1.5 }}>
            Entrega estas credenciales al empleado. La contraseña temporal deja de ser válida
            cuando él cambie su contraseña y no se volverá a mostrar.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          pb: { xs: 2.5, sm: 3 },
          pt: 1.5,
          gap: 1,
          flexDirection: isSmallScreen ? "column-reverse" : "row",
        }}
      >
        <Button variant="outlined" onClick={() => void handleCopyAll()} fullWidth={isSmallScreen}>
          {copiedAll ? "¡Copiado!" : "Copiar credenciales"}
        </Button>
        <Button variant="contained" onClick={onClose} fullWidth={isSmallScreen}>
          Listo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TempPasswordDialog;
