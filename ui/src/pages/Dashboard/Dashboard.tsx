import { Button, Container, Grid, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Panel de Administrador
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Button
            component={Link}
            to="/users"
            variant="contained"
            color="primary"
            fullWidth
          >
            Control de Usuarios
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            component={Link}
            to="/roles"
            variant="contained"
            color="primary"
            fullWidth
          >
            Control de Roles
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            component={Link}
            to="/permissions"
            variant="contained"
            color="primary"
            fullWidth
          >
            Control Permisos
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
