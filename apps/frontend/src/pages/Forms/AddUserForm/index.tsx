import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { IconEye, IconEyeOff, IconLock, IconMail, IconRotate, IconUser, IconUsers } from "@tabler/icons-react";
import OutlinedInput from "@mui/material/OutlinedInput";
import { canGrantRole, isRoleSelectable } from "@choferes/shared";
import { Role } from "../../../models/Role";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import FORMS from "../../../constants/forms.constants";
import {
  boxRoot,
  gridContainer,
  iconStyle,
  formControl,
  menuPaperProps,
  sectionTitle,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
} from "./styles";
import { validateName, validateEmail, validateUsername, validatePassword } from '../../../utils/userValidation';

interface AddUserFormProps {
  onSubmit: (user: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    roleNames: string[];
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  roles: Role[];
  /** Permisos agregados de quien crea la cuenta: acotan los roles que puede dar. */
  actorPermissions?: string[];
  /** Nombres de los roles de quien crea la cuenta. */
  actorRoleNames?: string[];
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  roles,
  actorPermissions = [],
  actorRoleNames = [],
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleNames: [] as string[],
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleNames: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Una cuenta puede llevar varios roles (los permisos se suman). Solo se
  // ofrecen los roles que quien crea la cuenta puede conceder: la misma regla
  // que valida el servidor, para no dejar elegir algo que el API va a rechazar.
  const grantor = { permissions: actorPermissions, roles: actorRoleNames };
  const selectableRoles = roles.filter((role) => isRoleSelectable(role.name));
  const grantableRoles = selectableRoles.filter((role) =>
    canGrantRole(grantor, {
      name: role.name,
      permissionCodes: (role.permissions ?? []).map((permission) => permission.code),
    }),
  );
  const ungrantableRoles = selectableRoles.filter(
    (role) => !grantableRoles.some((granted) => granted.id === role.id),
  );
  const selectedRoles = grantableRoles.filter((role) => formData.roleNames.includes(role.name));

  // Field validation for the form
  const validateField = (name: string, value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? "" : FORMS.ROLE_REQUIRED;
    }
    if (!value.trim()) {
      return FORMS.REQUIRED_FIELD;
    }
    switch (name) {
      case "firstName":
      case "lastName":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "username":
        return validateUsername(value);
      case "password":
        return validatePassword(value);
      case "roleNames":
        if (!value.trim()) {
          return FORMS.ROLE_REQUIRED;
        }
        break;
    }
    return "";
  };

  // Handles field changes and validation
  const handleFieldChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleRoleNamesChange = (next: string[]) => {
    // Solo roles que el actor puede conceder: un valor que llegue por otro
    // camino (restaurar el formulario) no debe poder colarse en el envío.
    const allowed = grantableRoles
      .map((role) => role.name)
      .filter((name) => next.includes(name));
    handleFieldChange("roleNames", allowed);
  };

  // Checks if the form is valid
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.username.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.roleNames.length > 0 &&
      errors.firstName === "" &&
      errors.lastName === "" &&
      errors.email === "" &&
      errors.username === "" &&
      errors.password === "" &&
      errors.roleNames === ""
    );
  };

  // Submits the form data if valid
  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        roleNames: formData.roleNames,
      });
    }
  };

  // Clears the form and errors
  const handleClearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      roleNames: [],
    });
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      roleNames: "",
    });
  };

  // Toggles password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={boxRoot}>
      <Grid container spacing={2.5} sx={gridContainer}>
        {/* Section: Información personal */}
        <Grid item xs={12}>
          <Typography component="h3" sx={sectionTitle(theme)}>
            Información personal
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.FIRST_NAME_PLACEHOLDER}

            label={FORMS.ADD_USER.FIRST_NAME_LABEL}
            variant="outlined"
            fullWidth
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            icon={<IconUser style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.LAST_NAME_PLACEHOLDER}

            label={FORMS.ADD_USER.LAST_NAME_LABEL}
            variant="outlined"
            fullWidth
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            icon={<IconUser style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        {/* Section: Acceso */}
        <Grid item xs={12}>
          <Typography component="h3" sx={sectionTitle(theme)}>
            Acceso
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.EMAIL_PLACEHOLDER}

            label={FORMS.ADD_USER.EMAIL_LABEL}
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email !== ""}
            helperText={errors.email}
            icon={<IconMail style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 255 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.USERNAME_PLACEHOLDER}

            label={FORMS.ADD_USER.USERNAME_LABEL}
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={(e) => handleFieldChange("username", e.target.value)}
            error={errors.username !== ""}
            helperText={errors.username}
            icon={<IconUser style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 50 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.PASSWORD_PLACEHOLDER}

            label={FORMS.ADD_USER.PASSWORD_LABEL}
            variant="outlined"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            error={errors.password !== ""}
            helperText={errors.password}
            icon={<IconLock style={iconStyle} />}
            sx={formControl(theme)}
            inputProps={{ maxLength: 100, autoComplete: "new-password" }}
            endAdornment={
              <IconButton onClick={handleTogglePassword} edge="end" size="small">
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </IconButton>
            }
          />
        </Grid>

        {/* Section: Rol */}
        <Grid item xs={12}>
          <Typography component="h3" sx={sectionTitle(theme)}>
            Rol
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl
            variant="outlined"
            fullWidth
            error={errors.roleNames !== ""}
            sx={formControl(theme)}
          >
            <Select
              multiple
              displayEmpty
              value={formData.roleNames}
              onChange={(e) => {
                const next = e.target.value;
                handleRoleNamesChange(typeof next === "string" ? next.split(",") : next);
              }}
              renderValue={(selected) => {
                const names = selected as string[];
                if (names.length === 0) {
                  return (
                    <Typography
                      sx={{
                        color: theme.palette.text.secondary,
                        opacity: 0.6,
                        fontSize: "0.875rem",
                        fontWeight: 400,
                      }}
                    >
                      {FORMS.ADD_USER.ROLE_LABEL}
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {names.map((name) => (
                      <Typography
                        key={name}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.8125rem",
                          color: theme.palette.text.primary,
                          bgcolor: theme.tokens.colors.hover,
                          borderRadius: "6px",
                          px: 0.75,
                          py: 0.25,
                        }}
                      >
                        {name}
                      </Typography>
                    ))}
                  </Box>
                );
              }}
              input={
                <OutlinedInput
                  placeholder={FORMS.ADD_USER.ROLE_LABEL}
                  startAdornment={
                    <InputAdornment position="start">
                      <IconUsers style={iconStyle} />
                    </InputAdornment>
                  }
                />
              }
              MenuProps={menuPaperProps}
            >
              {grantableRoles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  <Checkbox
                    size="small"
                    checked={formData.roleNames.includes(role.name)}
                    sx={{ p: 0.5, mr: 1 }}
                  />
                  <ListItemText
                    primary={role.name}
                    secondary={role.description || undefined}
                    primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                  />
                </MenuItem>
              ))}
              {/* Se listan, deshabilitados, para que quede claro que existen y
                  por qué no se pueden dar: la cuenta actual tiene menos
                  permisos que ese rol. */}
              {ungrantableRoles.map((role) => (
                <MenuItem key={role.id} value={role.name} disabled>
                  <Checkbox size="small" checked={false} disabled sx={{ p: 0.5, mr: 1 }} />
                  <ListItemText
                    primary={role.name}
                    secondary="Tu cuenta no tiene sus permisos"
                    primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                  />
                </MenuItem>
              ))}
            </Select>
            {errors.roleNames !== "" ? (
              <FormHelperText error>{errors.roleNames}</FormHelperText>
            ) : (
              <FormHelperText>
                Los permisos de todos los roles elegidos se suman.
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        {selectedRoles.length > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                p: 1.5,
                borderRadius: "12px",
                backgroundColor: theme.tokens.colors.accentSoft,
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                Acceso que tendrá la cuenta
              </Typography>
              {selectedRoles.map((role) => (
                <Typography
                  key={role.id}
                  sx={{ fontSize: "0.75rem", color: theme.tokens.colors.textMuted, lineHeight: 1.45 }}
                >
                  {role.name}: {(role.permissions ?? []).length} permiso
                  {(role.permissions ?? []).length === 1 ? "" : "s"}
                  {role.description ? ` · ${role.description}` : ""}
                </Typography>
              ))}
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="text"
              onClick={handleClearForm}
              startIcon={<IconRotate size={16} />}
              fullWidth={isSmallScreen}
              sx={clearButton}
            >
              Limpiar
            </Button>
            <Box sx={actionsInnerBox}>
              {onCancel && (
                <Button
                  variant="text"
                  onClick={onCancel}
                  disabled={isLoading}
                  fullWidth={isSmallScreen}
                  sx={cancelButton}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="text"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                fullWidth={isSmallScreen}
                sx={submitButton}
              >
                Crear
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUserForm;
