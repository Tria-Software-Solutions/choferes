import { useMediaQuery, useTheme } from "@mui/material";

// La interfaz tipo app (barra inferior, barra superior nativa, hojas) se usa en
// teléfonos y tablets (< md); desde md se conserva la interfaz web de siempre.
export const useMobileShell = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
};
