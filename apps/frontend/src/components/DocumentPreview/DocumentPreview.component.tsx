import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography, useTheme } from "@mui/material";
import { IconDownload, IconEye, IconFile, IconFileAlert } from "@tabler/icons-react";
import DialogComponent from "../Dialog/Dialog.component";
import { downloadDocument } from "../../services/documentService";
import type { DocumentDTO } from "../../services/documentService";

/**
 * Tamaño legible de un documento (B / KB / MB).
 * Compartido por Documentos (admin y Mi Panel) y por la vista previa.
 */
export const formatBytes = (bytes: number): string => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Descarga una data URL base64 validando el esquema: una URL `javascript:` se
 * ejecutaría en la sesión de quien la abre.
 * Compartido por Documentos (admin y Mi Panel) y por la vista previa.
 */
export const triggerDownload = (url: string | undefined, name: string): void => {
  if (!url || !/^data:[\w.+-]+\/[\w.+-]+;base64,/.test(url)) return;
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export type DocumentPreviewKind = "image" | "pdf" | "video" | "audio" | "text" | "unsupported";

/**
 * Qué visor corresponde a un archivo. Se apoya en el MIME guardado al subirlo
 * y, si vino vacío, en la extensión del nombre (el navegador ignora el MIME
 * que declara el data URL, así que el visor se guía por esto).
 */
export const getPreviewKind = (
  mimeType?: string | null,
  name?: string | null,
): DocumentPreviewKind => {
  const mime = (mimeType ?? "").toLowerCase().split(";")[0].trim();
  const ext = (name ?? "").toLowerCase().split(".").pop() ?? "";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("text/") || mime === "application/json" || mime === "application/xml") {
    return "text";
  }
  if (["txt", "csv", "tsv", "md", "log", "json", "xml", "html", "css", "js", "ts"].includes(ext)) {
    return "text";
  }
  return "unsupported";
};

/** Convierte un data URL en texto UTF-8 (para previsualizar .txt/.csv/…). */
const decodeDataUrlText = (dataUrl: string): string => {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return "";
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  try {
    const raw = /;base64/i.test(header) ? atob(payload) : decodeURIComponent(payload);
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return "";
  }
};

interface DocumentPreviewProps {
  open: boolean;
  /** Documento a previsualizar (solo metadatos; el binario se trae al abrir). */
  doc: DocumentDTO | null;
  onClose: () => void;
}

// Visor de un documento: trae el archivo completo y lo muestra según su tipo.
// Si el navegador no puede renderizarlo (docx, xlsx…) se avisa y queda el botón
// de descarga. Lo usan la página de Documentos y Mi Panel → Documentos.
export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ open, doc, onClose }) => {
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  // Se conserva el último documento no nulo para que el encabezado no quede
  // vacío durante la animación de cierre del diálogo.
  const [shown, setShown] = useState<DocumentDTO | null>(doc);
  const [full, setFull] = useState<DocumentDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (doc) setShown(doc);
  }, [doc]);

  useEffect(() => {
    if (!open || !doc) {
      setFull(null);
      setLoading(false);
      setFailed(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    downloadDocument(doc.id)
      .then((data) => {
        if (!cancelled) setFull(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, doc]);

  const kind = getPreviewKind(full?.mimeType ?? shown?.mimeType, full?.name ?? shown?.name);
  const dataUrl = full?.data;

  const body = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 6 }}>
          <CircularProgress size={30} />
          <Typography variant="body2" sx={{ color: colors.textMuted }}>
            Cargando documento…
          </Typography>
        </Box>
      );
    }
    if (failed) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 6 }}>
          <IconFileAlert size={34} color={colors.textMuted} />
          <Typography variant="body2" sx={{ color: colors.textMuted }}>
            No se pudo cargar el documento
          </Typography>
        </Box>
      );
    }
    if (!dataUrl) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 6 }}>
          <IconFile size={34} color={colors.textMuted} />
          <Typography variant="body2" sx={{ color: colors.textMuted }}>
            Este archivo no tiene contenido para mostrar.
          </Typography>
        </Box>
      );
    }
    switch (kind) {
      case "image":
        return (
          <Box
            component="img"
            src={dataUrl}
            alt={shown?.name ?? "Documento"}
            sx={{
              display: "block",
              maxWidth: "100%",
              maxHeight: { xs: "55vh", sm: "60vh" },
              objectFit: "contain",
              borderRadius: "10px",
              mx: "auto",
            }}
          />
        );
      case "pdf":
        return (
          <Box
            component="iframe"
            src={dataUrl}
            title={shown?.name ?? "Documento"}
            sx={{
              display: "block",
              width: "100%",
              height: { xs: "55vh", sm: "62vh" },
              border: "none",
              borderRadius: "10px",
              backgroundColor: colors.surface,
            }}
          />
        );
      case "video":
        return (
          <Box
            component="video"
            controls
            src={dataUrl}
            sx={{
              display: "block",
              width: "100%",
              maxHeight: { xs: "55vh", sm: "60vh" },
              borderRadius: "10px",
              backgroundColor: "#000",
            }}
          />
        );
      case "audio":
        return (
          <Box component="audio" controls src={dataUrl} sx={{ display: "block", width: "100%", py: 2 }} />
        );
      case "text":
        return (
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              maxHeight: { xs: "55vh", sm: "62vh" },
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: colors.text,
              backgroundColor: colors.surface,
              border: borders.hairline,
              borderRadius: "10px",
            }}
          >
            {decodeDataUrlText(dataUrl)}
          </Box>
        );
      default:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              py: 5,
              px: 2,
              textAlign: "center",
            }}
          >
            <IconFile size={34} color={colors.textMuted} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              No se puede previsualizar este tipo de archivo
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textMuted }}>
              Descárgalo para abrirlo con una aplicación de tu equipo.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      icon={<IconEye />}
      title={shown?.name ?? "Documento"}
      subtitle={
        shown
          ? [formatBytes(shown.size), shown.mimeType || "tipo desconocido"].join(" · ")
          : undefined
      }
      paperSx={{
        minWidth: { xs: "calc(100vw - 32px)", sm: 560 },
        maxWidth: { xs: "calc(100vw - 32px)", sm: 720, md: 900 },
      }}
      actions={
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "flex-end",
          }}
        >
          <Button variant="outlined" onClick={onClose} fullWidth={false}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<IconDownload size={16} />}
            onClick={() => triggerDownload(full?.data, full?.name ?? shown?.name ?? "documento")}
            disabled={!full?.data}
          >
            Descargar
          </Button>
        </Box>
      }
    >
      {body()}
    </DialogComponent>
  );
};

export default DocumentPreview;
