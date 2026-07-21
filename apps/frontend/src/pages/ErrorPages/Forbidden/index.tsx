import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Home } from "lucide-react";
import forbiddenSvg from "../../../assets/images/403.svg";
import { ERRORS } from "../../../constants/constants";
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

const Forbidden: React.FC = () => {
  const navigate = useNavigate();
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
              src={forbiddenSvg}
              alt="Error 403"
              sx={imageStyles}
            />

            <Typography sx={subtitleStyles}>
              {ERRORS.ERROR_403_SUBTITLE}
            </Typography>
            <Typography variant="caption" sx={errorCodeText}>
              ERROR 403 — {ERRORS.ACCESS_DENIED}
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
              {ERRORS.ERROR_403_DESCRIPTION}
            </Typography>

            <Box sx={actionsBoxStyles}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Home size={20} />}
                onClick={() => navigate("/")}
                fullWidth={isSmallScreen}
                aria-label={ERRORS.GO_HOME}
              >
                {ERRORS.GO_HOME}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography variant="caption" sx={captionStyles}>
          {ERRORS.ERROR_403_CONTACT}
        </Typography>
      </Box>
    </Box>
  );
};

export default Forbidden;
