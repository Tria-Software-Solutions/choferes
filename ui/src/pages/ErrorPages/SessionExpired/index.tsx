import { useAuth } from "../../../hooks/useAuth";
import {
  Box,
  Typography,
  Button,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LogIn } from "lucide-react";
import sessionSvg from "../../../assets/images/401.svg";
import ERRORS from "../../../constants/errors.constants";
import {
  wrapper,
  content,
  imageStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  primaryButtonStyles,
  captionStyles,
} from "./styles";

const SessionExpired: React.FC = () => {
  const { logoutUser } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={wrapper}>
      <Fade in timeout={1000}>
        <Slide direction="up" in timeout={1000}>
          <Box sx={content}>
            <Box
              component="img"
              src={sessionSvg}
              alt="Session expired"
              sx={imageStyles}
            />
            <Typography sx={subtitleStyles}>
              {ERRORS.SESSION_EXPIRED_SUBTITLE}
            </Typography>
            <Typography sx={descriptionStyles}>
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
                sx={primaryButtonStyles}
                aria-label={ERRORS.SESSION_EXPIRED_BUTTON}
              >
                {ERRORS.SESSION_EXPIRED_BUTTON}
              </Button>
            </Box>
            <Typography
              variant="caption"
              sx={captionStyles}
            >
              {ERRORS.SESSION_EXPIRED_CAPTION}
            </Typography>
          </Box>
        </Slide>
      </Fade>
    </Box>
  );
};

export default SessionExpired;