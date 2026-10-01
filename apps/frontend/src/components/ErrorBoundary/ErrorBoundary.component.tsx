import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { lightTokens } from "../../theme/tokens";
import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";
import ROUTES from "../../constants/routes.constants";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryClassProps extends ErrorBoundaryProps {
  theme: Theme;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryClassProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryClassProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Error capturado:", error);
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleRetry = () => {
    // ChunkLoadError (rutas lazy) significa que el chunk quedó obsoleto tras un
    // rebuild del dev server. Solo una recarga completa de página recupera el
    // manifest actualizado con los nombres de chunk nuevos.
    if (this.state.error?.name === "ChunkLoadError") {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = ROUTES.LOGIN;
  };

  render() {
    if (this.state.hasError) {
      // The boundary must never throw itself: fall back to the light tokens
      // when rendered under a plain MUI theme.
      const { colors, borders, shadows } = this.props.theme.tokens ?? lightTokens;

      return (
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            px: 2,
            py: 4,
            backgroundColor: colors.canvas,
          }}
        >
          <Box
            role="alert"
            sx={{
              width: "100%",
              maxWidth: 480,
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              borderRadius: "18px",
              border: borders.paper,
              backgroundColor: colors.surface,
              boxShadow: `0 1px 2px ${shadows.paper}, 0 12px 32px -12px ${shadows.dialogSoft}`,
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: 52,
                height: 52,
                mx: "auto",
                mb: 2.5,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                color: colors.error,
                backgroundColor: colors.errorSoft,
              }}
            >
              <IconAlertTriangle size={24} stroke={1.85} />
            </Box>

            <Typography
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.375rem" },
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                mb: 1,
                color: colors.text,
              }}
            >
              ¡Algo salió mal!
            </Typography>

            <Typography
              sx={{
                fontSize: "0.9rem",
                lineHeight: 1.6,
                mb: 3,
                color: colors.textMuted,
              }}
            >
              Se ha producido un error inesperado en esta sección. Puedes
              recargar la página o volver al inicio para continuar.
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 1.75,
                  textAlign: "left",
                  borderRadius: "10px",
                  border: borders.hairline,
                  backgroundColor: colors.surfaceSunken,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mb: 0.75,
                    color: colors.textMuted,
                  }}
                >
                  Detalles del error (consola)
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
                    wordBreak: "break-word",
                    color: colors.error,
                  }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", sm: "row" },
                gap: 1.25,
                justifyContent: "center",
              }}
            >
              <Button
                variant="outlined"
                startIcon={<IconHome size={16} />}
                onClick={this.handleGoHome}
              >
                Ir al Inicio
              </Button>
              <Button
                variant="contained"
                startIcon={<IconRefresh size={16} />}
                onClick={this.handleRetry}
              >
                Reintentar
              </Button>
            </Box>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorBoundary — catches React rendering errors and shows a themed fallback UI.
 *
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <ErrorBoundaryClass theme={theme}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;
