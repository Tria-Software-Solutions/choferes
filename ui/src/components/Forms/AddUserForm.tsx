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
import CustomTextField from "../Textfield/CustomTextField";
import { FORMS } from '../../constants/constants';

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
    <Box sx={{ width: "100%", p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
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
            icon={
              <PersonOutlinedIcon
                sx={{ color: theme.palette.text.secondary }}
              />
            }
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
            icon={
              <PersonOutlinedIcon
                sx={{ color: theme.palette.text.secondary }}
              />
            }
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
            icon={
              <EmailOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
            }
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
            icon={
              <PersonOutlinedIcon
                sx={{ color: theme.palette.text.secondary }}
              />
            }
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
            icon={
              <LockOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
            }
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
            fullWidth
            error={errors.roleName !== ""}
            sx={{
              marginTop: "8px",
              "& .MuiOutlinedInput-root, & .MuiSelect-select": {
                backgroundColor: "#fff",
                borderRadius: 2,
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000",
                  borderWidth: 2,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000",
                },
                "&.Mui-focused": {
                  backgroundColor: "#fff",
                  outline: "none",
                  boxShadow: "none",
                },
              },
            }}
          >
            <InputLabel>{FORMS.ADD_USER.ROLE_LABEL}</InputLabel>
            <Select
              value={formData.roleName}
              label={FORMS.ADD_USER.ROLE_LABEL}
              onChange={(e) => handleFieldChange("roleName", e.target.value)}
              input={
                <OutlinedInput
                  label={FORMS.ADD_USER.ROLE_LABEL}
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupOutlinedIcon
                        sx={{ color: theme.palette.text.secondary }}
                      />
                    </InputAdornment>
                  }
                />
              }
              sx={{
                "& .MuiSelect-select": {
                  paddingLeft: "14px",
                  paddingRight: "14px",
                },
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 320,
                    overflowY: 'auto',
                  },
                },
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            {errors.roleName && (
              <Box
                sx={{
                  color: theme.palette.error.main,
                  fontSize: "0.75rem",
                  mt: 0.5,
                }}
              >
                {errors.roleName}
              </Box>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: "1px solid",
              borderColor: theme.palette.divider,
            }}
          >
            <Box sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.info.main }}>
              <InfoOutlinedIcon
                sx={{ color: theme.palette.info.main, mr: { xs: 1, sm: 2 } }}
              />
            </Box>
            <Box>
              <Box
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                }}
              >
                {FORMS.ADD_USER.INFO_TITLE}
              </Box>
              <Box
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                }}
              >
                {FORMS.ADD_USER.INFO_DESC}
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              gap: { xs: 1, sm: 2 },
              pt: 2,
              borderTop: "1px solid",
              borderColor: theme.palette.divider,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={{
                minHeight: { xs: 44, sm: 48 },
                fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                order: { xs: 3, sm: 1 },
              }}
            >
              {FORMS.ADD_USER.BUTTON_ADD}
            </Button>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 2 },
                width: { xs: "100%", sm: "auto" },
                order: { xs: 1, sm: 2 },
              }}
            >
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  fullWidth={isSmallScreen}
                  sx={{
                    minHeight: { xs: 44, sm: 48 },
                    fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                  }}
                >
                  {FORMS.ADD_USER.BUTTON_ADDING}
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                startIcon={<AddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                  fontWeight: 600,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                {isLoading ? FORMS.ADD_USER.BUTTON_ADDING : FORMS.ADD_USER.BUTTON_ADD}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUserForm;
