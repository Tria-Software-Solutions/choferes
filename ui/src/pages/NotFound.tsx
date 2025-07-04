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
import ERRORS from "../constants/errors.constants";
import {
  outerBoxStyles,
  innerBoxStyles,
  iconStyles,
  titleStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  homeButtonStyles,
  exploreButtonStyles,
  captionStyles
} from "./NotFound.styles";

// NotFound page component for displaying 404 errors
const NotFound: React.FC = () => {
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
              <SearchOffIcon sx={iconStyles(theme)} aria-label="Not found icon" />
              <Typography
                variant="h1"
                component="h1"
                sx={titleStyles(theme)}
              >
                {ERRORS.ERROR_404_TITLE}
              </Typography>
              <Typography
                variant="h5"
                color="text.primary"
                sx={subtitleStyles}
              >
                {ERRORS.ERROR_404_SUBTITLE}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={descriptionStyles}
              >
                {ERRORS.ERROR_404_DESCRIPTION}
              </Typography>
              <Box sx={actionsBoxStyles}>
                <Button
                  variant="contained"
                  color="info"
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
                  color="primary"
                  size="large"
                  startIcon={<ExploreIcon />}
                  onClick={() => navigate("/dashboard")}
                  fullWidth={isSmallScreen}
                  sx={exploreButtonStyles}
                  aria-label={ERRORS.ERROR_404_EXPLORE}
                >
                  {ERRORS.ERROR_404_EXPLORE}
                </Button>
              </Box>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={captionStyles}
              >
                {ERRORS.ERROR_404_CONTACT}
              </Typography>
            </Box>
          </Slide>
        </Fade>
      </Box>
    </Container>
  );
};

export default NotFound;
