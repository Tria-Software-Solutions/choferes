import React, { useState, useEffect } from "react";
import { Role } from "../../models/Role";
import { fetchRoles } from "../../services/roleService";
import {
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const ManageRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const getAllRoles = async () => {
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    };

    getAllRoles();
  }, []);

  return (
    <Box>
      <List>
        {roles.map((role) => (
          <ListItem key={role.id}>
            <ListItemText primary={role.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ManageRoles;
