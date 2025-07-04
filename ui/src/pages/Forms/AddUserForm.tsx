import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import OutlinedInput from "@mui/material/OutlinedInput";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Role } from "../../models/Role";
import CustomTextField from "../../components/Textfield/CustomTextField";
import FORMS from "../../constants/forms.constants";
import {
  boxRoot,
  gridContainer,
  iconSx,
  formControl,
  menuPaperProps,
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
} from './AddUserForm.styles';

interface AddUserFormProps {
  onSubmit: (user: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    roleName: string;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  roles: Role[];
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  roles,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    roleName: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Field validation for the form
  const validateField = (name: string, value: string) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!value.trim()) {
      return FORMS.REQUIRED_FIELD;
    }

    switch (name) {
      case "firstName":
      case "lastName":
        if (!nameRegex.test(value)) {
          return FORMS.NAME_LETTERS_ONLY;
        }
        if (value.trim().length < 2) {
          return FORMS.MIN_2_CHARS;
        }
        if (value.trim().length > 50) {
          return FORMS.MAX_50_CHARS;
        }
        break;
      case "email":
        if (!emailRegex.test(value)) {
          return FORMS.EMAIL_INVALID;
        }
        break;
      case "username":
        if (!usernameRegex.test(value)) {
          return FORMS.USERNAME_FORMAT;
        }
        if (value.trim().length < 3) {
          return FORMS.MIN_3_CHARS;
        }
        if (value.trim().length > 30) {
          return FORMS.MAX_30_CHARS;
        }
        break;
      case "password":
        if (!passwordRegex.test(value)) {
          return FORMS.PASSWORD_INVALID;
        }
        break;
      case "roleName":
        if (!value.trim()) {
          return FORMS.ROLE_REQUIRED;
        }
        break;
    }

    return "";
  };

  // Handles field changes and validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Checks if the form is valid
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.username.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.roleName.trim() !== "" &&
      errors.firstName === "" &&
      errors.lastName === "" &&
      errors.email === "" &&
      errors.username === "" &&
      errors.password === "" &&
      errors.roleName === ""
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
        roleName: formData.roleName.trim(),
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
      roleName: "",
    });
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      roleName: "",
    });
  };

  // Toggles password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={boxRoot}>
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            label={FORMS.ADD_USER.FIRST_NAME_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_USER.FIRST_NAME_PLACEHOLDER}
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            icon={<PersonOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label={FORMS.ADD_USER.LAST_NAME_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_USER.LAST_NAME_PLACEHOLDER}
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            icon={<PersonOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label={FORMS.ADD_USER.EMAIL_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_USER.EMAIL_PLACEHOLDER}
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email !== ""}
            helperText={errors.email}
            icon={<EmailOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label={FORMS.ADD_USER.USERNAME_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_USER.USERNAME_PLACEHOLDER}
            value={formData.username}
            onChange={(e) => handleFieldChange("username", e.target.value)}
            error={errors.username !== ""}
            helperText={errors.username}
            icon={<PersonOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <CustomTextField
            label={FORMS.ADD_USER.PASSWORD_LABEL}
            variant="outlined"
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder={FORMS.ADD_USER.PASSWORD_PLACEHOLDER}
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            error={errors.password !== ""}
            helperText={errors.password}
            icon={<LockOutlinedIcon sx={iconSx(theme)} />}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl
            variant="outlined"
            fullWidth
            sx={formControl(theme)}
          >
            <InputLabel>{FORMS.ADD_USER.ROLE_LABEL}</InputLabel>
            <Select
              label={FORMS.ADD_USER.ROLE_LABEL}
              value={formData.roleName}
              onChange={(e) => handleFieldChange("roleName", e.target.value)}
              error={errors.roleName !== ""}
              input={
                <OutlinedInput
                  label={FORMS.ADD_USER.ROLE_LABEL}
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupOutlinedIcon sx={iconSx(theme)} />
                    </InputAdornment>
                  }
                />
              }
              MenuProps={menuPaperProps}
            >
              {roles.map((role) => (
                <MenuItem key={role.name} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <InfoOutlinedIcon sx={{ ...iconSx(theme), ...infoIconBox(theme) }} />
            </Box>
            <Box>
              <Box sx={infoTitle(theme)}>{FORMS.ADD_USER.INFO_TITLE}</Box>
              <Box sx={infoDesc(theme)}>{FORMS.ADD_USER.INFO_DESC}</Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={clearButton}
            >
              Limpiar
            </Button>
            <Box sx={actionsInnerBox}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  fullWidth={isSmallScreen}
                  sx={cancelButton}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                startIcon={<AddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={submitButton}
              >
                Agregar
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUserForm;
