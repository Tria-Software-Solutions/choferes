import { useAuth } from "../hooks/useAuth";
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
import TimerOffIcon from "@mui/icons-material/TimerOff";
import LoginIcon from "@mui/icons-material/Login";
import SecurityIcon from "@mui/icons-material/Security";
import { ERRORS } from "../constants/constants";

const SessionExpired: React.FC = () => {
  const { logoutUser } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  mb: { xs: 2, sm: 3 },
                }}
              >
                <TimerOffIcon
                  sx={{
                    fontSize: { xs: 80, sm: 100, md: 120 },
                    color: theme.palette.secondary.main,
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                  }}
                  aria-label="Timer off icon"
                />
                <SecurityIcon
                  sx={{
                    fontSize: { xs: 30, sm: 35, md: 40 },
                    color: theme.palette.secondary.dark,
                    position: "absolute",
                    top: { xs: -8, sm: -10 },
                    right: { xs: -8, sm: -10 },
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  }}
                  aria-label="Security icon"
                />
              </Box>

              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: { xs: 1, sm: 2 },
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                }}
              >
                {ERRORS.SESSION_EXPIRED_TITLE}
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
                {ERRORS.SESSION_EXPIRED_SUBTITLE}
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
                {ERRORS.SESSION_EXPIRED_DESCRIPTION}
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
                  color="secondary"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={logoutUser}
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                    fontWeight: 600,
                    px: { xs: 2, sm: 4 },
                    py: { xs: 1, sm: 1.5 },
                  }}
                  aria-label={ERRORS.SESSION_EXPIRED_BUTTON}
                >
                  {ERRORS.SESSION_EXPIRED_BUTTON}
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
                {ERRORS.SESSION_EXPIRED_CAPTION}
              </Typography>
            </Box>
          </Slide>
        </Fade>
      </Container>
    </Box>
  );
};

export default SessionExpired;
