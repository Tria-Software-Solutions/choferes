import { useAuth } from "../../../hooks/useAuth";
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
import { TimerOff, LogIn, Shield } from "lucide-react";
import ERRORS from "../../../constants/errors.constants";
import {
  outerBoxStyles,
  innerBoxStyles,
  timerBoxStyles,
  titleStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  loginButtonStyles,
  captionStyles,
} from "./styles";

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
                <TimerOff
                  size={48}
                  color={theme.palette.secondary.main}
                  aria-label="Timer off icon"
                />
                <Shield
                  size={32}
                  color={theme.palette.secondary.dark}
                  style={{ position: 'absolute', top: -10, right: -10 }}
                  aria-label="Security icon"
                />
              </Box>
              <Typography variant="h3" component="h1" sx={titleStyles(theme)}>
                {ERRORS.SESSION_EXPIRED_TITLE}
              </Typography>
              <Typography variant="h5" color="text.primary" sx={subtitleStyles}>
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
                  startIcon={<LogIn size={20} />}
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
