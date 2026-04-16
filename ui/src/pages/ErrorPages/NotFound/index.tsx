import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  useTheme,
  Fade,
  Slide,
  useMediaQuery,
  keyframes,
  Card,
  CardContent,
} from "@mui/material";
import { SearchX, Home, Compass } from "lucide-react";
import ERRORS from "../../../constants/errors.constants";
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
  captionStyles,
} from "./styles";

// NotFound page component for displaying 404 errors
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Floating animation keyframes
  const float1 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  `;
  const float2 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 30px) scale(0.95); }
    66% { transform: translate(30px, -20px) scale(1.05); }
  `;
  const float3 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, 40px) scale(1.1); }
  `;

  // Handler for navigating to the home page
  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Box sx={outerBoxStyles}>
        {/* Floating decorative orbs */}
        <Box
          sx={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: theme.palette.mode === "dark"
              ? "radial-gradient(circle, rgba(120,119,198,0.4) 0%, rgba(120,119,198,0) 70%)"
              : "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%)",
            filter: "blur(40px)",
            top: "10%",
            left: "10%",
            animation: `${float1} 15s ease-in-out infinite`,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: theme.palette.mode === "dark"
              ? "radial-gradient(circle, rgba(255,119,198,0.25) 0%, rgba(255,119,198,0) 70%)"
              : "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)",
            filter: "blur(50px)",
            bottom: "5%",
            right: "15%",
            animation: `${float2} 18s ease-in-out infinite`,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: theme.palette.mode === "dark"
              ? "radial-gradient(circle, rgba(120,219,255,0.3) 0%, rgba(120,219,255,0) 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)",
            filter: "blur(30px)",
            top: "50%",
            right: "5%",
            animation: `${float3} 12s ease-in-out infinite`,
            zIndex: 0,
          }}
        />
        <Fade in timeout={1000}>
          <Slide direction="up" in timeout={1000}>
            <Card className="auth-card" sx={innerBoxStyles}>
              <CardContent>
              <Box>
                <Box sx={iconStyles(theme)}>
                  <SearchX
                    size={64}
                    aria-label="Not found icon"
                  />
                </Box>
                <Typography variant="h1" component="h1" sx={titleStyles(theme)}>
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
                    startIcon={<Home size={20} />}
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
                    startIcon={<Compass size={20} />}
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
              </CardContent>
            </Card>
          </Slide>
        </Fade>
    </Box>
  );
};

export default NotFound;
