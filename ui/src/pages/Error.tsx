import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const ErrorPage: React.FC = () => {
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
      <Typography variant="h1" color="textDisabled" fontWeight="bold">
        Oops, algo salió mal
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
        Hubo un problema al cargar la página. Por favor, intenta nuevamente más
        tarde.
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

export default ErrorPage;
