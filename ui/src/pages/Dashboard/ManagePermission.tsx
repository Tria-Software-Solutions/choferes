import React, { useState, useEffect } from "react";
import { Permission } from "../../models/Permission";
import { fetchPermissions } from "../../services/permissionService";
import {
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const ManagePermission = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const getAllPermissions = async () => {
      const fetchedPermissions = await fetchPermissions();
      setPermissions(fetchedPermissions);
    };

    getAllPermissions();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Permission Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary">
            Add Permission
          </Button>
        </Grid>
        <Grid item xs={12}>
          <List>
            {permissions.map((permission) => (
              <ListItem key={permission.id}>
                <ListItemText primary={permission.name} />
                {/* Aquí agregarías botones para asignar o eliminar permisos */}
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ManagePermission;
