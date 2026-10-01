import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconCompass, IconHome } from "@tabler/icons-react";
import notFoundSvg from "../../../assets/images/404.svg";
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
import ROUTES from "../../../constants/routes.constants";

const NotFound: React.FC = () => {
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
            border: theme.tokens.borders.paper,
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
              borderBottom: theme.tokens.borders.paper,
            }}
          >
            <Box
              component="img"
              src={notFoundSvg}
              alt="Error 404"
              sx={imageStyles}
            />

            <Typography sx={subtitleStyles}>
              {ERRORS.ERROR_404_SUBTITLE}
            </Typography>
            <Typography variant="caption" sx={errorCodeText}>
              ERROR 404 — {ERRORS.PAGE_NOT_FOUND}
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
              {ERRORS.ERROR_404_DESCRIPTION}
            </Typography>

            <Box sx={actionsBoxStyles}>
              <Button
                variant="contained"
                size="large"
                startIcon={<IconHome size={20} />}
                onClick={() => navigate(ROUTES.LOGIN)}
                fullWidth={isSmallScreen}
                aria-label={ERRORS.GO_HOME}
              >
                {ERRORS.GO_HOME}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<IconCompass size={20} />}
                onClick={() => navigate(ROUTES.DASHBOARD)}
                fullWidth={isSmallScreen}
                aria-label={ERRORS.ERROR_404_EXPLORE}
              >
                {ERRORS.ERROR_404_EXPLORE}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography variant="caption" sx={captionStyles}>
          {ERRORS.ERROR_404_CONTACT}
        </Typography>
      </Box>
    </Box>
  );
};

export default NotFound;
