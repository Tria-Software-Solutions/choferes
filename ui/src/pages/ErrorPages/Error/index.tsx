import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Home, RefreshCw } from "lucide-react";
import errorSvg from "../../../assets/images/500.svg";
import { ERRORS } from "../../../constants/constants";
import {
  wrapper,
  content,
  imageStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  captionStyles,
} from "./styles";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleGoHome = () => {
    navigate("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box sx={wrapper}>
      <Fade in timeout={1000}>
        <Slide direction="up" in timeout={1000}>
          <Box sx={content}>
            <Box
              component="img"
              src={errorSvg}
              alt="Error 500"
              sx={imageStyles}
            />
            <Typography sx={subtitleStyles}>
              {ERRORS.ERROR_500_SUBTITLE}
            </Typography>
            <Typography sx={descriptionStyles}>
              {ERRORS.ERROR_500_DESCRIPTION}
            </Typography>
            <Box sx={actionsBoxStyles}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Home size={20} />}
                onClick={handleGoHome}
                fullWidth={isSmallScreen}
                sx={primaryButtonStyles}
                aria-label={ERRORS.GO_HOME}
              >
                {ERRORS.GO_HOME}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshCw size={20} />}
                onClick={handleRefresh}
                fullWidth={isSmallScreen}
                sx={secondaryButtonStyles}
                aria-label={ERRORS.RELOAD}
              >
                {ERRORS.RELOAD}
              </Button>
            </Box>
            <Typography
              variant="caption"
              sx={captionStyles}
            >
              {ERRORS.CONTACT_SUPPORT}
            </Typography>
          </Box>
        </Slide>
      </Fade>
    </Box>
  );
};

export default ErrorPage;