import React, { useState, useEffect } from "react";
import { Role } from "../../models/Role";
import { fetchRoles } from "../../services/roleService";
import {
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const getAllRoles = async () => {
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    };

    getAllRoles();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Role Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary">
            Add Role
          </Button>
        </Grid>
        <Grid item xs={12}>
          <List>
            {roles.map((role) => (
              <ListItem key={role.id}>
                <ListItemText primary={role.name} />
                {/* Aquí agregarías botones para asignar o eliminar roles */}
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RoleManagement;
