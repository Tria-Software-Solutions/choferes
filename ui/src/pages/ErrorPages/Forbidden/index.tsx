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
import { Lock, Home, Shield } from "lucide-react";
import { ERRORS } from "../../../constants/constants";
import {
  outerBoxStyles,
  innerBoxStyles,
  lockBoxStyles,
  titleStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  homeButtonStyles,
  captionStyles,
} from "./styles";

// Forbidden page component for displaying 403/unauthorized errors
const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Handler for navigating to the home page
  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="md">
      <Box sx={outerBoxStyles}>
        <Fade in timeout={800}>
          <Slide direction="up" in timeout={1000}>
            <Box sx={innerBoxStyles}>
              <Box sx={lockBoxStyles}>
                <Lock size={48} color={theme.palette.warning.main} aria-label="Lock icon" />
                <Shield
                  size={32}
                  color={theme.palette.warning.dark}
                  style={{ position: 'absolute', top: -10, right: -10 }}
                  aria-label="Security icon"
                />
              </Box>
              <Typography variant="h3" component="h1" sx={titleStyles(theme)}>
                {ERRORS.ERROR_403_TITLE}
              </Typography>
              <Typography variant="h5" color="text.primary" sx={subtitleStyles}>
                {ERRORS.ERROR_403_SUBTITLE}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={descriptionStyles}
              >
                {ERRORS.ERROR_403_DESCRIPTION}
              </Typography>
              <Box sx={actionsBoxStyles}>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  startIcon={<Home size={20} />}
                  onClick={handleGoHome}
                  fullWidth={isSmallScreen}
                  sx={homeButtonStyles}
                  aria-label={ERRORS.GO_HOME}
                >
                  {ERRORS.GO_HOME}
                </Button>
              </Box>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={captionStyles}
              >
                {ERRORS.ERROR_403_CONTACT}
              </Typography>
            </Box>
          </Slide>
        </Fade>
      </Box>
    </Container>
  );
};

export default Forbidden;
