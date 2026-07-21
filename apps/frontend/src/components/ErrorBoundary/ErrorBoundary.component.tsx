import React from "react";
import {
  Box,
  Typography,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryClassProps extends ErrorBoundaryProps {
  mode: "light" | "dark";
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
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const { mode } = this.props;
      const isDark = mode === "dark";

      return (
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDark
              ? "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f23 100%)"
              : "linear-gradient(135deg, #f8f9fc 0%, #eef0f5 50%, #e8eaf0 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative gradient orbs */}
          <Box
            sx={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: { xs: 300, md: 500 },
              height: { xs: 300, md: 500 },
              borderRadius: "50%",
              background: isDark
                ? "radial-gradient(circle, rgba(255,69,58,0.08) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "-15%",
              left: "-5%",
              width: { xs: 250, md: 400 },
              height: { xs: 250, md: 400 },
              borderRadius: "50%",
              background: isDark
                ? "radial-gradient(circle, rgba(255,69,58,0.05) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              maxWidth: 520,
              px: { xs: 3, md: 6 },
              position: "relative",
              zIndex: 1,
              animation: "fadeSlideUp 0.6s ease-out",
              "@keyframes fadeSlideUp": {
                from: { opacity: 0, transform: "translateY(20px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {/* Icon container */}
            <Box
              sx={{
                width: { xs: 80, sm: 96 },
                height: { xs: 80, sm: 96 },
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDark
                  ? `linear-gradient(135deg, ${alpha("#ff3b30", 0.2)}, ${alpha(
                      "#ff3b30",
                      0.1,
                    )})`
                  : `linear-gradient(135deg, ${alpha("#dc2626", 0.1)}, ${alpha(
                      "#dc2626",
                      0.05,
                    )})`,
                mb: { xs: 3, sm: 4 },
                boxShadow: isDark
                  ? `0 0 40px ${alpha("#ff3b30", 0.15)}`
                  : `0 0 30px ${alpha("#dc2626", 0.1)}`,
              }}
            >
              <AlertTriangle
                size={40}
                strokeWidth={1.5}
                color={isDark ? "#ff6b6b" : "#dc2626"}
              />
            </Box>

            {/* Title */}
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                letterSpacing: -0.5,
                lineHeight: 1.2,
                mb: 1.5,
                color: isDark ? "#f0f0f5" : "#1a1a2e",
              }}
            >
              ¡Algo salió mal!
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "0.95rem" },
                fontWeight: 400,
                lineHeight: 1.7,
                maxWidth: 440,
                mb: { xs: 3, sm: 4 },
                color: isDark
                  ? alpha("#ffffff", 0.6)
                  : alpha("#1a1a2e", 0.6),
              }}
            >
              Se ha producido un error inesperado en esta sección. Puedes
              recargar la página o volver al inicio para continuar.
            </Typography>

            {/* Error details (collapsible) */}
            {this.state.error && (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 440,
                  mb: { xs: 3, sm: 4 },
                  p: 2,
                  borderRadius: "8px",
                  background: isDark
                    ? alpha("#000", 0.3)
                    : alpha("#000", 0.04),
                  border: `1px solid ${isDark ? alpha("#ff3b30", 0.15) : alpha("#dc2626", 0.1)}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mb: 1,
                    color: isDark
                      ? alpha("#ffffff", 0.4)
                      : alpha("#1a1a2e", 0.4),
                  }}
                >
                  Detalles del error (consola)
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontFamily:
                      "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
                    wordBreak: "break-word",
                    color: isDark
                      ? alpha("#ff6b6b", 0.8)
                      : "#dc2626",
                  }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            {/* Action buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<RefreshCw size={18} />}
                onClick={this.handleRetry}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  px: { xs: 3, sm: 5 },
                  borderRadius: "10px",
                  textTransform: "none",
                  background: isDark
                    ? "linear-gradient(135deg, #ff3b30, #dc2626)"
                    : "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "#fff",
                  boxShadow: isDark
                    ? `0 4px 20px ${alpha("#ff3b30", 0.3)}`
                    : `0 4px 16px ${alpha("#dc2626", 0.25)}`,
                  "&:hover": {
                    background: isDark
                      ? "linear-gradient(135deg, #ff453a, #c41e1e)"
                      : "linear-gradient(135deg, #b91c1c, #991b1b)",
                    boxShadow: isDark
                      ? `0 6px 24px ${alpha("#ff3b30", 0.4)}`
                      : `0 6px 20px ${alpha("#dc2626", 0.35)}`,
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                Reintentar
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Home size={18} />}
                onClick={this.handleGoHome}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  px: { xs: 3, sm: 5 },
                  borderRadius: "10px",
                  textTransform: "none",
                  color: isDark ? alpha("#ffffff", 0.8) : alpha("#1a1a2e", 0.7),
                  borderColor: isDark
                    ? alpha("#ffffff", 0.15)
                    : alpha("#1a1a2e", 0.15),
                  "&:hover": {
                    borderColor: isDark
                      ? alpha("#ffffff", 0.35)
                      : alpha("#1a1a2e", 0.35),
                    backgroundColor: isDark
                      ? alpha("#ffffff", 0.05)
                      : alpha("#1a1a2e", 0.04),
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Ir al Inicio
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
    <ErrorBoundaryClass mode={theme.palette.mode}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;
