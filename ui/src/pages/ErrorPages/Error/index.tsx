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
import { ERRORS } from "../../../constants/constants";
import {
  outerBoxStyles,
  innerBoxStyles,
  iconStyles,
  titleStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  homeButtonStyles,
  reloadButtonStyles,
  captionStyles
} from "./styles";

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
    <Container maxWidth="md">
      <Box sx={outerBoxStyles}>
        <Fade in timeout={800}>
          <Slide direction="up" in timeout={1000}>
            <Box sx={innerBoxStyles}>
              <ErrorOutlineIcon sx={iconStyles(theme)} aria-label="Error icon" />
              <Typography
                variant="h3"
                component="h1"
                sx={titleStyles(theme)}
              >
                {ERRORS.ERROR_500_TITLE}
              </Typography>
              <Typography
                variant="h5"
                color="text.primary"
                sx={subtitleStyles}
              >
                {ERRORS.ERROR_500_SUBTITLE}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={descriptionStyles}
              >
                {ERRORS.ERROR_500_DESCRIPTION}
              </Typography>
              <Box sx={actionsBoxStyles}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  fullWidth={isSmallScreen}
                  sx={homeButtonStyles}
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
                  sx={reloadButtonStyles}
                  aria-label={ERRORS.RELOAD}
                >
                  {ERRORS.RELOAD}
                </Button>
              </Box>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={captionStyles}
              >
                {ERRORS.CONTACT_SUPPORT}
              </Typography>
            </Box>
          </Slide>
        </Fade>
      </Box>
    </Container>
  );
};

export default ErrorPage;
