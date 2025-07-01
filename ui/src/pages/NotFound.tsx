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
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        textAlign="center"
        px={3}
      >
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
              <SearchOffIcon
                sx={{
                  fontSize: 120,
                  color: theme.palette.info.main,
                  mb: 3,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                }}
                aria-label="Not found icon"
              />

              <Typography
                variant="h1"
                component="h1"
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontSize: { xs: "4rem", md: "6rem" },
                }}
              >
                404
              </Typography>

              <Typography
                variant="h5"
                color="text.primary"
                fontWeight="medium"
                sx={{ mb: 2 }}
              >
                Página no encontrada
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                Lo sentimos, la página que estás buscando no existe o ha sido
                movida. Verifica la URL o navega a una página diferente.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1, sm: 2 },
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  color="info"
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
                  aria-label="Ir al inicio"
                >
                  Ir al Inicio
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<ExploreIcon />}
                  onClick={() => navigate("/dashboard")}
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                  }}
                  aria-label="Explorar"
                >
                  Explorar
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.disabled"
                sx={{
                  mt: 4,
                  display: "block",
                  opacity: 0.7,
                }}
              >
                Si crees que esto es un error, contacta a soporte técnico
              </Typography>
            </Box>
          </Slide>
        </Fade>
      </Box>
    </Container>
  );
};

export default NotFound;
