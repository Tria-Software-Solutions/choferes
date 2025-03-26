import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/roles");
    }
  };

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
      <LockIcon color="disabled" sx={{ mb: 3, fontSize: "50px" }}/>
      <Typography variant="h1" color="textDisabled" fontWeight="bold">
        Acceso Denegado
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
        No tienes permisos para acceder a esta página.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ height: "56px" }}
        onClick={handleGoBack}
      >
        Regresar
      </Button>
    </Box>
  );
};

export default Forbidden;
