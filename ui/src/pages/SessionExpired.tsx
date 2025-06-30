import { useAuth } from "../hooks/useAuth";
import { Box, Typography, Button } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

const SessionExpired: React.FC = () => {
  const { logoutUser } = useAuth();
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      textAlign="center"
      px={3}
    >
      <WarningIcon color="disabled" sx={{ mb: 3, fontSize: "50px" }} />
      <Typography variant="h2" color="textDisabled" fontWeight="bold">
        Sesión Expirada
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
        Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ height: "56px" }}
        onClick={logoutUser}
      >
        Iniciar Sesión
      </Button>
    </Box>
  );
};

export default SessionExpired;
