import { Box, Typography } from "@mui/material";

const Settings = () => {
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
        Settings Page
      </Typography>
    </Box>
  );
};

export default Settings;