import { useAuth } from "../../../hooks/useAuth";
import {
  Box,
  Typography,
  Button,
  Paper,
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
  errorCodeText,
  descriptionStyles,
  actionsBoxStyles,
  captionStyles,
} from "./styles";

const SessionExpired: React.FC = () => {
  const { logoutUser } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={wrapper}>
      <Box sx={content}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: { xs: 3, md: 5 },
              py: { xs: 3, md: 4 },
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            <Box
              component="img"
              src={sessionSvg}
              alt="Session expired"
              sx={imageStyles}
            />

            <Typography sx={subtitleStyles}>
              {ERRORS.SESSION_EXPIRED_SUBTITLE}
            </Typography>
            <Typography variant="caption" sx={errorCodeText}>
              401 — SESSION EXPIRED
            </Typography>
          </Box>

          {/* Body */}
          <Box
            sx={{
              px: { xs: 3, md: 5 },
              py: { xs: 3, md: 4 },
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography sx={descriptionStyles}>
              {ERRORS.SESSION_EXPIRED_DESCRIPTION}
            </Typography>

            <Box sx={actionsBoxStyles}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LogIn size={20} />}
                onClick={logoutUser}
                fullWidth={isSmallScreen}
                aria-label={ERRORS.SESSION_EXPIRED_BUTTON}
              >
                {ERRORS.SESSION_EXPIRED_BUTTON}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography variant="caption" sx={captionStyles}>
          {ERRORS.SESSION_EXPIRED_CAPTION}
        </Typography>
      </Box>
    </Box>
  );
};

export default SessionExpired;
