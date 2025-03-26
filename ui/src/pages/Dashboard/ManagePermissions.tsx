import React, { useState, useEffect } from "react";
import { Permission } from "../../models/Permission";
import { usePermissions } from "../../hooks/usePermission";
import { getPermissions } from "../../services/permissionService";
import {
  Backdrop,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";

const ManagePermissions: React.FC = () => {
  const { isLoadingPermissions } =
    usePermissions();
  const [permissions, setPermissions] = useState<Permission[]>([]);
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
    const getAllPermissions = async () => {
      const fetchedPermissions = await getPermissions();
      setPermissions(fetchedPermissions);
    };

    getAllPermissions();
  }, []);

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
          {filteredPermissions.length > 0 ? (
            <Stack spacing={2}>
              <Box>
                <SearchBar
                  placeholder="Buscar permiso"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                />
              </Box>
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
            </Stack>
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
