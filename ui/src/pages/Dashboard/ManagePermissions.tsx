import React, { useState, useEffect } from "react";
import { Permission } from "../../models/Permission";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchPermissions } from "../../store/slices/permissionsSlice";
import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import SearchBar from "../../components/SearchBar/SearchBar";

const ManagePermissions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, isLoadingPermissions } = useSelector(
    (state: RootState) => state.permissions
  );
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    []
  );
  const [filter, setFilter] = useState("");
  const half = Math.ceil(filteredPermissions.length / 2);
  const leftColumn = filteredPermissions.slice(0, half);
  const rightColumn = filteredPermissions.slice(half);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredPermissions(
      permissions.filter((permission) =>
        normalizeString(`${permission.name}`)
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      )
    );
  }, [filter, permissions, filteredPermissions.length]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  return (
    <Box>
      {isLoadingPermissions ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingTop: "10%",
          }}
        >
          <Backdrop
            sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
            open={isLoadingPermissions}
          >
            <CircularProgress />
          </Backdrop>
        </Box>
      ) : (
        <>
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={6}>
              {filteredPermissions && (
                <SearchBar
                  placeholder="Buscar permiso"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
            </Grid>
          </Grid>
          <br />
          {filteredPermissions.length > 0 ? (
            <Grid container spacing={2}>
              {filteredPermissions.map((permission) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={permission.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.2,
                      borderRadius: 1,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      cursor: 'default',
                      minHeight: 36,
                    }}
                  >
                    <Box sx={{
                      mr: 1,
                      color: 'primary.main',
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <span role="img" aria-label="permiso">🔑</span>
                    </Box>
                    <Typography variant="body2" fontWeight={400} color="text.primary" noWrap>
                      {permission.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                No se encontraron permisos para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ManagePermissions;
