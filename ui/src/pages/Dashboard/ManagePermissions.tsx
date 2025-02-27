import React, { useState, useEffect } from "react";
import { Permission } from "../../models/Permission";
import { fetchPermissions } from "../../services/permissionService";
import { Box, List, ListItem, ListItemText } from "@mui/material";

const ManagePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const getAllPermissions = async () => {
      const fetchedPermissions = await fetchPermissions();
      setPermissions(fetchedPermissions);
    };

    getAllPermissions();
  }, []);

  return (
    <Box>
      <List>
        {permissions.map((permission) => (
          <ListItem key={permission.id}>
            <ListItemText primary={permission.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ManagePermissions;
