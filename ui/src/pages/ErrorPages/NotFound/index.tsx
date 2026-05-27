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
import { Home, Compass } from "lucide-react";
import notFoundSvg from "../../../assets/images/404.svg";
import ERRORS from "../../../constants/errors.constants";
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

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Box sx={wrapper}>
      <Fade in timeout={1000}>
        <Slide direction="up" in timeout={1000}>
          <Box sx={content}>
            <Box
              component="img"
              src={notFoundSvg}
              alt="Error 404"
              sx={imageStyles}
            />
            <Typography sx={subtitleStyles}>
              {ERRORS.ERROR_404_SUBTITLE}
            </Typography>
            <Typography sx={descriptionStyles}>
              {ERRORS.ERROR_404_DESCRIPTION}
            </Typography>
            <Box sx={actionsBoxStyles}>
              <Button
                variant="contained"
                color="info"
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
                startIcon={<Compass size={20} />}
                onClick={() => navigate("/dashboard")}
                fullWidth={isSmallScreen}
                sx={secondaryButtonStyles}
                aria-label={ERRORS.ERROR_404_EXPLORE}
              >
                {ERRORS.ERROR_404_EXPLORE}
              </Button>
            </Box>
            <Typography
              variant="caption"
              sx={captionStyles}
            >
              {ERRORS.ERROR_404_CONTACT}
            </Typography>
          </Box>
        </Slide>
      </Fade>
    </Box>
  );
};

export default NotFound;