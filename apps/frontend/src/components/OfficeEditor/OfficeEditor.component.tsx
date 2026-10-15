import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppBar, Box, Button, IconButton, Toolbar, Typography, useTheme } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { getOfficeEditorConfig } from "../../services/documentService";
import type { DocumentDTO } from "../../services/documentService";
import { DotsLoader } from "../Loader";

// Instancia del editor que devuelve `DocsAPI.DocEditor` (solo lo que usamos).
interface DocsApiDocEditor {
  destroyEditor?: () => void;
}

// API global que inyecta el document server al cargar su `api.js`.
interface DocsApiGlobal {
  DocEditor: new (placeholderId: string, config: Record<string, unknown>) => DocsApiDocEditor;
}

declare global {
  interface Window {
    DocsAPI?: DocsApiGlobal;
  }
}

const SCRIPT_ID = "onlyoffice-api-script";

// El editor vive en el document server: hay que cargar su `api.js` desde ahí. La
// URL depende del servidor configurado en el backend, así que se carga en cuanto
// se conoce y se reutiliza el mismo script entre aperturas.
const loadOnlyOfficeApi = async (documentServerUrl: string): Promise<void> => {
  const src = `${documentServerUrl.replace(/\/+$/, "")}/web-apps/apps/api/documents/api.js`;
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing && existing.src === src && window.DocsAPI) return;
  if (existing) existing.remove();

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el editor de oficina"));
    document.body.appendChild(script);
  });
};

interface OfficeEditorProps {
  open: boolean;
  /** Documento a editar (solo metadatos; el binario lo trae el document server). */
  doc: DocumentDTO | null;
  onClose: () => void;
  /** Se llama al cerrar si la sesión pudo haber guardado cambios. */
  onSaved?: () => void;
}

// Editor de oficina (Word/Excel/PowerPoint) incrustado en un diálogo a pantalla
// completa. Solo lo usa la página de Documentos para los roles de gestión.
const OfficeEditor: React.FC<OfficeEditorProps> = ({ open, doc, onClose, onSaved }) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<DocsApiDocEditor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !doc) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(false);

    getOfficeEditorConfig(doc.id)
      .then(async ({ documentServerUrl, config }) => {
        await loadOnlyOfficeApi(documentServerUrl);
        if (cancelled || !containerRef.current || !window.DocsAPI) return;
        // El editor necesita un elemento contenedor presente en el DOM.
        containerRef.current.innerHTML = "";
        const mountId = `onlyoffice-${doc.id}`;
        const mount = document.createElement("div");
        mount.id = mountId;
        mount.style.height = "100%";
        mount.style.width = "100%";
        containerRef.current.appendChild(mount);
        editorRef.current = new window.DocsAPI.DocEditor(mountId, {
          ...config,
          events: { onError: () => setError(true) },
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      try {
        editorRef.current?.destroyEditor?.();
      } catch {
        // El editor ya se había destruido.
      }
      editorRef.current = null;
    };
  }, [open, doc]);

  const handleClose = useCallback(() => {
    // Los cambios los persiste el document server por callback; al cerrar se
    // recarga el listado por si cambió el tamaño o la fecha del archivo.
    onSaved?.();
    onClose();
  }, [onClose, onSaved]);

  if (!open || !doc) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: theme.zIndex.modal,
        backgroundColor: theme.tokens.colors.surface,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Typography noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: "0.95rem" }}>
            {doc.name}
          </Typography>
          <Button size="small" variant="outlined" onClick={handleClose}>
            Cerrar
          </Button>
          <IconButton size="small" aria-label="Cerrar editor" onClick={handleClose}>
            <IconX size={18} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              flexDirection: "column",
              backgroundColor: theme.tokens.colors.surface,
              zIndex: 1,
            }}
          >
            <DotsLoader size="md" />
            <Typography variant="body2" sx={{ color: theme.tokens.colors.textMuted }}>
              Abriendo el editor…
            </Typography>
          </Box>
        )}
        {error && !loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1,
              backgroundColor: theme.tokens.colors.surface,
              zIndex: 2,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              No se pudo abrir el editor de oficina
            </Typography>
            <Typography variant="caption" sx={{ color: theme.tokens.colors.textMuted }}>
              Revisa que el servidor de documentos esté configurado y disponible.
            </Typography>
          </Box>
        )}
        <Box ref={containerRef} sx={{ position: "absolute", inset: 0 }} />
      </Box>
    </Box>
  );
};

export default OfficeEditor;
