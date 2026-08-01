import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  FormControl,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { Plus, X, Users } from "lucide-react";
import { Permission } from "../../../models/Permission";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import PermissionTogglePanel from "../../../components/PermissionTogglePanel/PermissionTogglePanel.component";
import { FORMS } from "../../../constants/constants";
import {
  boxRoot,
  gridContainer,
  iconStyle,
  permissionsError,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
  formControl,
} from "./styles";

interface AddRoleFormProps {
  onSubmit: (role: { name: string; permissions: string[] }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  permissions: Permission[];
}

const AddRoleForm: React.FC<AddRoleFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  permissions,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  });
  const [errors, setErrors] = useState({
    name: "",
    permissions: "",
  });

  // Field validation for the form
  const validateField = (name: string, value: string | string[]) => {
    if (name === "name") {
      const nameValue = value as string;
      if (!nameValue.trim()) {
        return FORMS.LABEL_REQUIRED;
      }
      if (nameValue.trim().length < 2) {
        return FORMS.MIN_2_CHARS;
      }
      if (nameValue.trim().length > 50) {
        return FORMS.MAX_50_CHARS;
      }
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
      if (!nameRegex.test(nameValue)) {
        return FORMS.NAME_LETTERS_ONLY;
      }
    }

    if (name === "permissions") {
      const permissionsValue = value as string[];
      if (permissionsValue.length === 0) {
        return FORMS.DAYS_REQUIRED;
      }
    }

    return "";
  };

  // Handles field changes and validation
  const handleFieldChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Handles selected permissions changes
  const handlePermissionChange = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter((id) => id !== permissionId)
      : [...formData.permissions, permissionId];

    handleFieldChange("permissions", newPermissions);
  };

  // Checks if the form is valid
  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.permissions.length > 0 &&
      errors.name === "" &&
      errors.permissions === ""
    );
  };

  // Submits the form data if valid
  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        name: formData.name.trim(),
        permissions: formData.permissions,
      });
    }
  };

  // Clears the form and errors
  const handleClearForm = () => {
    setFormData({ name: "", permissions: [] });
    setErrors({ name: "", permissions: "" });
  };

  return (
    <Box sx={boxRoot}>
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {FORMS.ADD_ROLE.DIALOG_CONTENT_TITLE}
        </Typography>
      </Box>
      <Grid container spacing={2.5} sx={gridContainer}>
        {/* Section: Información del rol */}
        <Grid item xs={12}>
          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: theme.palette.text.secondary,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Información del rol
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextfieldComponent
            placeholder={FORMS.ADD_ROLE.NAME_PLACEHOLDER}
            variant="outlined"
            fullWidth
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            error={errors.name !== ""}
            helperText={errors.name}
            icon={<Users style={iconStyle} />}
            sx={formControl(theme)}
          />
        </Grid>

        {/* Section: Permisos */}
        <Grid item xs={12}>
          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: theme.palette.text.secondary,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {FORMS.ADD_ROLE.PERMISSIONS_LABEL}
          </Typography>
          <FormControl fullWidth error={errors.permissions !== ""}>
            <Box sx={{ mb: 1 }}>
              {errors.permissions && (
                <Box sx={permissionsError(theme)}>{errors.permissions}</Box>
              )}
            </Box>
            <PermissionTogglePanel
              permissions={permissions}
              selected={formData.permissions}
              onToggle={handlePermissionChange}
              getValue={(permission) => permission.id.toString()}
            />
          </FormControl>
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
                sx={submitButton}
              >
                {isLoading
                  ? FORMS.ADD_ROLE.BUTTON_ADDING
                  : FORMS.ADD_ROLE.BUTTON_ADD}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRoleForm;
