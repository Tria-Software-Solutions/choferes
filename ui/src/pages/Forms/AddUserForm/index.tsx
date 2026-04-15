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
  Typography,
} from "@mui/material";
import { Plus, X, Eye, EyeOff, User, Mail, Lock, Users, Info } from "lucide-react";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Role } from "../../../models/Role";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import FORMS from "../../../constants/forms.constants";
import {
  boxRoot,
  gridContainer,
  iconStyle,
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
} from "./styles";
import { validateName, validateEmail, validateUsername, validatePassword } from '../../../utils/userValidation';

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
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {FORMS.ADD_USER.DIALOG_CONTENT_TITLE}
        </Typography>
      </Box>
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.FIRST_NAME_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            error={errors.firstName !== ""}
            helperText={errors.firstName}
            icon={<User style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.LAST_NAME_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            error={errors.lastName !== ""}
            helperText={errors.lastName}
            icon={<User style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.EMAIL_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email !== ""}
            helperText={errors.email}
            icon={<Mail style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.USERNAME_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={(e) => handleFieldChange("username", e.target.value)}
            error={errors.username !== ""}
            helperText={errors.username}
            icon={<User style={iconStyle} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            placeholder={FORMS.ADD_USER.PASSWORD_PLACEHOLDER}
            variant="outlined"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            error={errors.password !== ""}
            helperText={errors.password}
            icon={<Lock style={iconStyle} />}
            endAdornment={
              <IconButton onClick={handleTogglePassword} edge="end" size="small">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </IconButton>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth sx={formControl(theme)}>
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
                      <Users style={iconStyle} />
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
              <Info style={iconStyle} />
            </Box>
            <Box>
              <Typography sx={infoTitle(theme)}>
                {FORMS.ADD_USER.INFO_TITLE}
              </Typography>
              <Typography sx={infoDesc(theme)}>
                {FORMS.ADD_USER.INFO_DESC}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<X />}
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
                disabled={!isFormValid || isLoading}
                startIcon={<Plus size={18} />}
                fullWidth={isSmallScreen}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  letterSpacing: "0.01em",
                  borderRadius: "12px",
                  minHeight: "42px",
                }}
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
