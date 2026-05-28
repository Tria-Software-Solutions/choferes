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
import { Home } from "lucide-react";
import forbiddenSvg from "../../../assets/images/403.svg";
import { ERRORS } from "../../../constants/constants";
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

const Forbidden: React.FC = () => {
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
              src={forbiddenSvg}
              alt="Error 403"
              sx={imageStyles}
            />
            <Typography sx={subtitleStyles}>
              {ERRORS.ERROR_403_SUBTITLE}
            </Typography>
            <Typography sx={descriptionStyles}>
              {ERRORS.ERROR_403_DESCRIPTION}
            </Typography>
            <Box sx={actionsBoxStyles}>
              <Button
                variant="contained"
                color="warning"
                size="large"
                startIcon={<Home size={20} />}
                onClick={handleGoHome}
                fullWidth={isSmallScreen}
                sx={primaryButtonStyles}
                aria-label={ERRORS.GO_HOME}
              >
                {ERRORS.GO_HOME}
              </Button>
            </Box>
            <Typography
              variant="caption"
              sx={captionStyles}
            >
              {ERRORS.ERROR_403_CONTACT}
            </Typography>
          </Box>
        </Slide>
      </Fade>
    </Box>
  );
};

export default Forbidden;