import { useNavigate } from "react-router-dom";
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
import { Lock, Home, Shield } from "lucide-react";
import { ERRORS } from "../../../constants/constants";
import {
  outerBoxStyles,
  innerBoxStyles,
  lockBoxStyles,
  lockIconStyles,
  securityIconStyles,
  titleStyles,
  subtitleStyles,
  descriptionStyles,
  actionsBoxStyles,
  homeButtonStyles,
  captionStyles,
} from "./styles";

// Forbidden page component for displaying 403/unauthorized errors
const Forbidden: React.FC = () => {
  const navigate = useNavigate();
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
              <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
              <Box sx={lockBoxStyles}>
                <Box sx={lockIconStyles(theme)}>
                  <Lock size={48} aria-label="Lock icon" />
                </Box>
                <Box sx={securityIconStyles(theme)}>
                  <Shield
                    size={32}
                    aria-label="Security icon"
                  />
                </Box>
              </Box>
              <Typography variant="h3" component="h1" sx={titleStyles(theme)}>
                {ERRORS.ERROR_403_TITLE}
              </Typography>
              <Typography variant="h5" color="text.primary" sx={subtitleStyles}>
                {ERRORS.ERROR_403_SUBTITLE}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={descriptionStyles}
              >
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
                  sx={homeButtonStyles}
                  aria-label={ERRORS.GO_HOME}
                >
                  {ERRORS.GO_HOME}
                </Button>
              </Box>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={captionStyles}
              >
                {ERRORS.ERROR_403_CONTACT}
              </Typography>
              </CardContent>
            </Card>
          </Slide>
        </Fade>
    </Box>
  );
};

export default Forbidden;
