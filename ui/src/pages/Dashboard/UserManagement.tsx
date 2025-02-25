import React, { useState, useEffect } from "react";
import { User } from "../../models/User";
import { fetchUsers } from "../../services/userService";
import {
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getAllUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };

    getAllUsers();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary">
            Add User
          </Button>
        </Grid>
        <Grid item xs={12}>
          <List>
            {users.map((user) => (
              <ListItem key={user.id}>
                <ListItemText
                  primary={user.username}
                  secondary={`Role ID: ${user.roleId}`}
                />
                {/* Aquí agregarías botones para editar o eliminar usuarios */}
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserManagement;
