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
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";

const ManagePermissions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, isLoadingPermissions } = useSelector(
    (state: RootState) => state.permissions
  );
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    []
  );
  const [totalCount, setTotalCount] = useState(0);
  const [editFields, setEditFields] = useState({
    name: "",
  });
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
    setTotalCount(filteredPermissions.length);
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
            <Grid item xs={12}>
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
          </Grid>
          <br/>
          {filteredPermissions.length > 0 ? (
            <EditableTable<Permission>
              data={filteredPermissions}
              columns={["name"]}
              editRowId={null}
              editFields={editFields}
              setEditField={(field, value) =>
                setEditFields({ ...editFields, [field]: value })
              }
              getRowId={(row) => row.id}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              noActions
            />
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
