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
import {
  outerBoxStyles,
  innerBoxStyles,
  timerBoxStyles,
  timerIconStyles,
  securityIconStyles,
  titleStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  loginButtonStyles,
  captionStyles
} from "./SessionExpired.styles";

// SessionExpired page component for handling expired user sessions
const SessionExpired: React.FC = () => {
  const { logoutUser } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="md">
      <Box sx={outerBoxStyles}>
        <Fade in timeout={800}>
          <Slide direction="up" in timeout={1000}>
            <Box sx={innerBoxStyles}>
              <Box sx={timerBoxStyles}>
                <TimerOffIcon sx={timerIconStyles(theme)} aria-label="Timer off icon" />
                <SecurityIcon sx={securityIconStyles(theme)} aria-label="Security icon" />
              </Box>
              <Typography
                variant="h3"
                component="h1"
                sx={titleStyles(theme)}
              >
                {ERRORS.SESSION_EXPIRED_TITLE}
              </Typography>
              <Typography
                variant="h5"
                color="text.primary"
                sx={subtitleStyles}
              >
                {ERRORS.SESSION_EXPIRED_SUBTITLE}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={descriptionStyles}
              >
                {ERRORS.SESSION_EXPIRED_DESCRIPTION}
              </Typography>
              <Box sx={actionsBoxStyles}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={logoutUser}
                  fullWidth={isSmallScreen}
                  sx={loginButtonStyles}
                  aria-label={ERRORS.SESSION_EXPIRED_BUTTON}
                >
                  {ERRORS.SESSION_EXPIRED_BUTTON}
                </Button>
              </Box>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={captionStyles}
              >
                {ERRORS.SESSION_EXPIRED_CAPTION}
              </Typography>
            </Box>
          </Slide>
        </Fade>
      </Box>
    </Container>
  );
};

export default SessionExpired;
