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
  Typography,
  useTheme,
} from "@mui/material";
import SearchBarComponent from "../../components/SearchBar/SearchBar.component";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import { DASHBOARD_PERMISSIONS } from "../../constants/constants";
import {
  loadingBoxStyles,
  backdropStyles,
  searchBarSx,
  permissionBoxStyles,
  permissionIconBoxStyles,
  permissionIconStyles,
  noPermissionsBoxStyles,
} from "./ManagePermissions.styles";

// ManagePermissions page component for permission management in the dashboard
const ManagePermissions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, isLoadingPermissions } = useSelector(
    (state: RootState) => state.permissions,
  );
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    [],
  );
  const [filter, setFilter] = useState("");
  const theme = useTheme();

  // Loads permissions data on mount
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // Filters permissions based on search input
  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredPermissions(
      permissions.filter((permission) =>
        normalizeString(`${permission.name}`)
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase()),
      ),
    );
  }, [filter, permissions, filteredPermissions.length]);

  // Handles search bar input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  return (
    <Box>
      {isLoadingPermissions ? (
        <Box
          sx={loadingBoxStyles}
        >
          <Backdrop
            sx={backdropStyles(theme)}
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
            <Grid item xs={12} md={4}>
              {filteredPermissions && (
                <SearchBarComponent
                  placeholder={DASHBOARD_PERMISSIONS.SEARCH_PLACEHOLDER}
                  value={filter}
                  onChange={handleFilterChange}
                  sx={searchBarSx ?? {}}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={8}></Grid>
          </Grid>
          <br />
          {filteredPermissions.length > 0 ? (
            <Grid container spacing={2}>
              {filteredPermissions.map((permission) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={permission.id}>
                  <Box
                    sx={permissionBoxStyles}
                  >
                    <Box
                      sx={permissionIconBoxStyles}
                    >
                      <VpnKeyOutlinedIcon
                        sx={permissionIconStyles}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={400}
                      color="text.primary"
                      noWrap
                    >
                      {permission.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={noPermissionsBoxStyles}
            >
              <Typography variant="h6" color="textSecondary">
                {DASHBOARD_PERMISSIONS.NO_PERMISSIONS}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ManagePermissions;
