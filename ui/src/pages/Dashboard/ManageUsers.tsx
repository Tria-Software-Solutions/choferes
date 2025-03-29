import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { useUsers } from "../../hooks/useUser";
import { useRoles } from "../../hooks/useRole";
import { useAppNotifications } from "../../components/Snackbar/SnackbarWrapper";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditableTable from "../../components/Table/EditableTable/EditableTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface TemporalPassword {
  id: number;
  temporalPassword: string;
}

const ManageUsers: React.FC = () => {
  const { userPermissions } = useAuth();
  const {
    users,
    isLoadingUsers,
    createUser,
    getUsers,
    updateUser,
    updateUserStatus,
    updateUserPassword,
    updateUserTemporalPassword,
  } = useUsers();
  const { roles, getRoleByName } = useRoles();
  const { showNotification } = useAppNotifications();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [addFields, setAddFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
  const [editFields, setEditFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
  const [openEmailTooltip, setOpenEmailTooltip] = useState(false);
  const [openUsernameTooltip, setOpenUsernameTooltip] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [userToChange, setUserToChange] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  // const [newPassword, setNewPassword] = useState("");
  // const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [temporalPasswordHidden, setTemporalPasswordHidden] = useState(true);
  const [generatedTemporalPassword, setGeneratedTemporalPassword] =
    useState<TemporalPassword>({ id: 0, temporalPassword: "" });
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddFormValid, setIsAddFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let filtered = users
      .map((user) => ({
        ...user,
        roleName: user.roles?.map((role: Role) => role.name).join(", "),
      }))
      .filter((user) =>
        normalizeString(
          `${user.firstName} ${user.lastName} ${user.email} ${user.username} ${user.roleName}`
        )
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      );

    if (!showInactive) {
      filtered = filtered.filter((user) => user.isActive);
    }

    setFilteredUsers(filtered);
    setTotalCount(filtered.length);
  }, [filter, users, showInactive]);

  const handleChangeShowInactive = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowInactive(event.target.checked);
  };

  const validateFields = useCallback(
    (fields: typeof editFields, isAddForm: boolean) => {
      const regex = {
        text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        username: /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/,
        password:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      };

      const isValid =
        regex.text.test(fields.firstName) &&
        regex.text.test(fields.lastName) &&
        regex.email.test(fields.email) &&
        regex.username.test(fields.username);

      return isAddForm
        ? isValid &&
            regex.password.test(fields.password) &&
            regex.text.test(fields.roleName)
        : isValid;
    },
    []
  );

  const validateNewPasswordFields = useCallback(async (fields: typeof passwordFields) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (fields.newPassword === "" || fields.confirmNewPassword === "") {
      setError("Los espacios son requeridos.");
      return false;
    }
    if (fields.newPassword !== fields.confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    if (
      !passwordRegex.test(fields.newPassword) ||
      !passwordRegex.test(fields.confirmNewPassword)
    ) {
      setError(
        "El valor es inválido.\n\n- Mínimo 8 caracteres.\n- Al menos una letra mayúscula.\n- Al menos una letra minúscula.\n- Al menos un número.\n- Al menos un carácter especial"
      );
      return false;
    }

    setError(null);
    return true;
  }, []);

  useEffect(
    () => setIsAddFormValid(validateFields(addFields, true)),
    [addFields, validateFields]
  );

  useEffect(() => {
    if (editRowId !== null)
      setIsEditFormValid(validateFields(editFields, false));
  }, [editFields, editRowId, validateFields]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const showTemporaryTooltip = (
    setTooltip: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setTooltip(true);
    setTimeout(() => setTooltip(false), 2000);
  };

  const handleCreate = async () => {
    try {
      const newUser: Omit<User, "id" | "temporalPassword" | "role"> = {
        firstName: addFields.firstName,
        lastName: addFields.lastName,
        email: addFields.email,
        username: addFields.username,
        password: addFields.password,
        roleName: addFields.roleName,
        isActive: true,
      };
      const role = await getRoleByName(addFields.roleName);
      await createUser(newUser, role.id);
      await getUsers();
      setAddFields({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        roleName: "",
      });
      showNotification(
        "El registro del usuario fue exitoso",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al registrar el usuario",
        "error",
        5000,
        false
      );
    }
  };

  const handleEdit = (user: User) => {
    setEditRowId(user.id);
    setEditFields({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: user.password,
      roleName: user?.roleName || "",
    });
  };

  const handleCancel = () => {
    setEditRowId(null);
  };

  const handleUpdate = async (id: number) => {
    try {
      const role = await getRoleByName(editFields.roleName);
      const updatedUser: Partial<User> = {
        ...editFields,
      };
      await updateUser(id, updatedUser, role.id);
      await getUsers();
      setEditRowId(null);
      setEditFields({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        roleName: "",
      });
      showNotification(
        "La actualización del usuario fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      handleCancel();
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar el usuario",
        "error",
        5000,
        false
      );
    }
  };

  const checkEmailExistence = (email: string): User | undefined => {
    return users.find((user) => user.email === email);
  };

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value.trim();
    if (checkEmailExistence(value)) {
      showTemporaryTooltip(setOpenEmailTooltip);
      return;
    }
    setAddFields((prevFields) => ({ ...prevFields, email: value }));
  };

  const checkUsernameExistence = (username: string): User | undefined => {
    return users.find((user) => user.username === username);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value.trim();
      if (checkUsernameExistence(value)) {
        showTemporaryTooltip(setOpenUsernameTooltip);
        return;
      }
      setAddFields((prevFields) => ({ ...prevFields, username: value }));
    };

  const handleOpenStatusDialog = async (row: any) => {
    setOpenStatusDialog(true);
    setUserToChange(row);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setUserToChange(null);
  };

  const handleStatusChange = async () => {
    try {
      if (userToChange !== null) {
        await updateUserStatus(userToChange.id, !userToChange.isActive);
        showNotification(
          "La actualización del estado del usuario fue exitosa",
          "success",
          3000,
          false
        );
      }
      handleCloseStatusDialog();
    } catch (error) {
      handleCancel();
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar el estado del usuario",
        "error",
        5000,
        false
      );
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleNewPassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPasswordFields({
      ...passwordFields,
      newPassword: event.target.value,
    });
  };

  const handleConfirmNewPassword = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPasswordFields({
      ...passwordFields,
      confirmNewPassword: event.target.value,
    });
  };

  const handleToggleNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleToggleConfirmNewPassword = () => {
    setShowConfirmNewPassword((prev) => !prev);
  };

  const handleGeneratePassword = async (id: number) => {
    try {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      let temporalPassword = "";
      do {
        temporalPassword = Math.random().toString(36).slice(-8) + "@A1";
      } while (!passwordRegex.test(temporalPassword));
      setGeneratedTemporalPassword({ id, temporalPassword });
      setTemporalPasswordHidden(false);
      await updateUserTemporalPassword(id, temporalPassword);
      showNotification(
        "Se ha creado una contraseña temporal",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al crear la contraseña temporal",
        "error",
        5000,
        false
      );
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        generatedTemporalPassword.temporalPassword
      );
      setCopyTooltipOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setCopyTooltipOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangePassword = async (
    e: React.FormEvent,
    id: number,
    handleClose: () => void
  ) => {
    e.preventDefault();

    const isValid = await validateNewPasswordFields(passwordFields);
    if (!isValid) return;

    try {
      await updateUserPassword(id, passwordFields.newPassword);
      setPasswordFields({
        newPassword: "",
        confirmNewPassword: "",
      });
      setTemporalPasswordHidden(true);
      handleClose();
      showNotification(
        "La actualización de la contraseña del usuario fue exitosa",
        "success",
        3000,
        false
      );
    } catch (error) {
      console.error(error);
      showNotification(
        "Ha ocurrido un error al actualizar la contraseña del usuario",
        "error",
        5000,
        false
      );
    }
  };

  const modalContentChangeUserPassword = (
    id: number,
    handleClose: () => void
  ) => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          margin: "auto",
        }}
      >
        <Typography>
          Puedes cambiar la contraseña manualmente o{" "}
          <Link
            sx={{ cursor: "pointer" }}
            onClick={() => handleGeneratePassword(id)}
          >
            generar una contraseña temporal
          </Link>
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          {!temporalPasswordHidden && id === generatedTemporalPassword.id && (
            <>
              <Typography variant="h6">
                {generatedTemporalPassword.temporalPassword}
              </Typography>
              <Tooltip
                title="Copiado!"
                open={copyTooltipOpen}
                placement="right"
                disableHoverListener
                arrow
              >
                <IconButton size="small" onClick={handleCopy}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
        <TextField
          label="Nueva Contraseña"
          variant="outlined"
          type={showNewPassword ? "text" : "password"}
          fullWidth
          sx={{
            height: 56,
          }}
          value={passwordFields.newPassword}
          onChange={(e) => handleNewPassword(e)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleToggleNewPassword} edge="end">
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirmar Contraseña"
          variant="outlined"
          type={showConfirmNewPassword ? "text" : "password"}
          fullWidth
          sx={{
            height: 56,
          }}
          value={passwordFields.confirmNewPassword}
          onChange={(e) => handleConfirmNewPassword(e)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleToggleConfirmNewPassword} edge="end">
                  {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Box>
            <Button
              variant="contained"
              color="error"
              sx={{ flex: 2, height: "56px" }}
              onClick={async (e) => {
                await handleChangePassword(e, id, handleClose);
              }}
            >
              Aceptar
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {isLoadingUsers ? (
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
            open={isLoadingUsers}
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
              {filteredUsers && (
                <SearchBar
                  placeholder="Buscar usuario"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{
                    maxWidth: "100%",
                  }}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="flex-start"
                justifyContent="flex-end"
                gap={2}
              >
                <FormControlLabel
                  control={
                    <Switch
                      size={isSmallScreen ? "small" : "medium"}
                      color="primary"
                      checked={showInactive}
                      onChange={handleChangeShowInactive}
                    />
                  }
                  label="Mostrar Inactivos"
                  labelPlacement="start"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={12}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Nombre"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.firstName}
                      onChange={(e) =>
                        setAddFields({
                          ...addFields,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Apellido"
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.lastName}
                      onChange={(e) =>
                        setAddFields({ ...addFields, lastName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Tooltip
                      title="Este correo electrónico ya está registrado"
                      open={openEmailTooltip}
                      disableHoverListener
                      placement="bottom"
                      arrow
                    >
                      <TextField
                        label="Correo Eléctronico"
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 56,
                        }}
                        value={addFields.email}
                        onChange={(e) => handleEmailChange(e)}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Tooltip
                      title="Este nombre de usuario ya está registrado"
                      open={openUsernameTooltip}
                      disableHoverListener
                      placement="bottom"
                      arrow
                    >
                      <TextField
                        label="Usuario"
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 56,
                        }}
                        value={addFields.username}
                        onChange={(e) => handleUsernameChange(e)}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Contraseña"
                      variant="outlined"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      sx={{
                        height: 56,
                      }}
                      value={addFields.password}
                      onChange={(e) =>
                        setAddFields({ ...addFields, password: e.target.value })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>Seleccione un rol</InputLabel>
                      <Select
                        label="Seleccione un rol"
                        value={addFields.roleName || ""}
                        onChange={(e) =>
                          setAddFields({
                            ...addFields,
                            roleName: e.target.value,
                          })
                        }
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.name}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Tooltip title="Agregar Usuario" arrow>
                  <Box
                    sx={{
                      width: { xs: "100%", md: "auto" },
                      display: "flex",
                      justifyContent: { xs: "stretch", md: "flex-end" },
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        minHeight: 56,
                        display: "flex",
                        justifyContent: "center",
                        lineHeight: "normal",
                        width: { xs: "100%", md: "auto" },
                      }}
                      onClick={handleCreate}
                      disabled={!isAddFormValid}
                    >
                      <PersonAddAlt1RoundedIcon />
                    </Button>
                  </Box>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredUsers.length > 0 ? (
            <EditableTable<User>
              data={filteredUsers}
              columns={[
                "firstName",
                "lastName",
                "username",
                "email",
                "roleName",
              ]}
              editRowId={editRowId}
              editFields={editFields}
              setEditField={(field, value) =>
                setEditFields({ ...editFields, [field]: value })
              }
              handleEdit={handleEdit}
              handleCancel={handleCancel}
              handleUpdate={handleUpdate}
              handleOpenStatusDialog={handleOpenStatusDialog}
              handlePasswordModal={modalContentChangeUserPassword}
              getRowId={(row) => row.id}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              isSaveDisabled={!isEditFormValid}
              userPermissions={userPermissions}
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
                No se encontraron usuarios para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Confirmar</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas cambiar el estado de este usuario?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" sx={{ flex: 1 }} onClick={handleStatusChange}>
            Aceptar
          </Button>
          <Button
            color="secondary"
            sx={{ flex: 1 }}
            onClick={handleCloseStatusDialog}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
