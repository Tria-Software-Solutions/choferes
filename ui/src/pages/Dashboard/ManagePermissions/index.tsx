import React, { useState, useEffect } from "react";
import { Permission } from "../../../models/Permission";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { fetchPermissions } from "../../../store/slices/permissionsSlice";
import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import { Key, ShieldCheck } from "lucide-react";
import { DASHBOARD_PERMISSIONS } from "../../../constants/constants";
import {
  loadingBoxStyles,
  backdropStyles,
  permissionBoxStyles,
  permissionIconBoxStyles,
  noPermissionsBoxStyles,
} from "./styles";
// ManagePermissions page component for permission management in the dashboard
const ManagePermissions: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, isLoadingPermissions } = useSelector(
    (state: RootState) => state.permissions,
  );
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    [],
  );
  const [filter, setFilter] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Loads permissions data on mount (only if not already loaded)
  useEffect(() => {
    if (permissions.length === 0) {
      dispatch(fetchPermissions());
    }
  }, [dispatch, permissions.length]);

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
    <Box sx={{ height: "100%", minHeight: "500px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Premium Header with Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "10px",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={22} color={theme.palette.primary.contrastText} />
              </Box>
              <Box>
                <Typography
                  variant={isSmallScreen ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    color: theme.palette.text.primary,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {isSmallScreen ? 'Permisos' : 'Gestión de Permisos'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {filteredPermissions.length} permisos disponibles
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Controls Row */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            {/* Search */}
            <Box flex={1} maxWidth={{ sm: "380px" }}>
              {filteredPermissions && (
                <SearchBarComponent
                  placeholder={DASHBOARD_PERMISSIONS.SEARCH_PLACEHOLDER}
                  value={filter}
                  onChange={handleFilterChange}
                  fullWidth
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {isLoadingPermissions ? (
            <Box sx={loadingBoxStyles}>
              <Backdrop sx={backdropStyles(theme)} open={isLoadingPermissions}>
                <CircularProgress />
              </Backdrop>
            </Box>
          ) : (
            <>
              {filteredPermissions.length > 0 ? (
                <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2, WebkitOverflowScrolling: "touch" }}>
                  <Grid container spacing={2}>
                    {filteredPermissions.map((permission) => (
                      <Grid item xs={12} sm={6} md={3} lg={3} key={permission.id}>
                        <Box sx={permissionBoxStyles}>
                          <Box sx={permissionIconBoxStyles}>
                            <Key size={24} color={theme.palette.primary.main} />
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
                </Box>
              ) : (
                <Box sx={{ ...noPermissionsBoxStyles, flex: 1, minHeight: 0 }}>
                  <Typography variant="h6" color="textSecondary">
                    {DASHBOARD_PERMISSIONS.NO_PERMISSIONS}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ManagePermissions;
