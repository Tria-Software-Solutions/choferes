import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  Fade,
  Slide,
  useMediaQuery,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ERRORS } from "../constants/constants";

// Error page component for displaying 500/internal server errors
const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Handler for navigating to the home page
  const handleGoHome = () => {
    navigate("/");
  };

  // Handler for refreshing the page
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="md" sx={{ p: 3 }}>
        <Fade in timeout={800}>
          <Slide direction="up" in timeout={1000}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxHeight: "100vh",
                py: { xs: 2, sm: 3 },
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: { xs: 80, sm: 100, md: 120 },
                  color: theme.palette.error.main,
                  mb: { xs: 2, sm: 3 },
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                }}
                aria-label="Error icon"
              />

              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: { xs: 1, sm: 2 },
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                }}
              >
                {ERRORS.ERROR_500_TITLE}
              </Typography>

              <Typography
                variant="h5"
                color="text.primary"
                fontWeight="medium"
                sx={{
                  mb: { xs: 1, sm: 2 },
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                }}
              >
                {ERRORS.ERROR_500_SUBTITLE}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: { xs: 2, sm: 3, md: 4 },
                  lineHeight: 1.6,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  maxWidth: 500,
                }}
              >
                {ERRORS.ERROR_500_DESCRIPTION}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1, sm: 2 },
                  justifyContent: "center",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                    fontWeight: 600,
                    px: { xs: 2, sm: 4 },
                    py: { xs: 1, sm: 1.5 },
                  }}
                  aria-label={ERRORS.GO_HOME}
                >
                  {ERRORS.GO_HOME}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                  }}
                  aria-label={ERRORS.RELOAD}
                >
                  {ERRORS.RELOAD}
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.disabled"
                sx={{
                  mt: { xs: 2, sm: 3, md: 4 },
                  display: "block",
                  opacity: 0.7,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {ERRORS.CONTACT_SUPPORT}
              </Typography>
            </Box>
          </Slide>
        </Fade>
      </Container>
    </Box>
  );
};

export default ErrorPage;
