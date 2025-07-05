import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Button,
  FormControl,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Permission } from "../../../models/Permission";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import { FORMS } from "../../../constants/constants";
import {
  boxRoot,
  gridContainer,
  iconSx,
  permissionsLabel,
  permissionsError,
  permissionsBox,
  categoryBox,
  categoryTitle,
  chipSx,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
} from './styles';

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

  // Groups permissions by category using useMemo
  const groupedPermissions = useMemo(() => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach((permission) => {
      const category = permission.name.split("_")[0];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  }, [permissions]);

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
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          {FORMS.ADD_ROLE.DIALOG_CONTENT_TITLE}
        </Typography>
      </Box>
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12}>
          <TextfieldComponent
            label={FORMS.ADD_ROLE.NAME_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_ROLE.NAME_PLACEHOLDER}
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            error={errors.name !== ""}
            helperText={errors.name}
            icon={<GroupOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={errors.permissions !== ""}>
            <Box sx={{ mb: 2 }}>
              <Box sx={permissionsLabel(theme)}>
                {FORMS.ADD_ROLE.PERMISSIONS_LABEL}
              </Box>
              {errors.permissions && (
                <Box sx={permissionsError(theme)}>
                  {errors.permissions}
                </Box>
              )}
            </Box>

            <Box sx={permissionsBox(theme)}>
              {Object.entries(groupedPermissions).map(
                ([category, categoryPermissions]) => (
                  <Box key={category} sx={categoryBox(theme)}>
                    <Box sx={categoryTitle(theme)}>
                      {category}
                    </Box>
                    <FormGroup row>
                      {categoryPermissions.map((permission) => (
                        <FormControlLabel
                          key={permission.id}
                          control={
                            <Checkbox
                              checked={formData.permissions.includes(permission.id.toString())}
                              onChange={() => handlePermissionChange(permission.id.toString())}
                              color="primary"
                            />
                          }
                          label={
                            <Box component="span" sx={chipSx(theme)}>
                              {permission.name.replace(/_/g, " ").toLowerCase()}
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </Box>
                )
              )}
            </Box>
          </FormControl>
        </Grid>

        {formData.permissions.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1,
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                }}
              >
                {FORMS.ADD_ROLE.PERMISSIONS_SELECTED(formData.permissions.length)}
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.permissions.map((permissionId) => {
                  const permission = permissions.find(
                    (p) => p.id.toString() === permissionId,
                  );
                  return permission ? (
                    <Chip
                      key={permissionId}
                      label={permission.name.replace(/_/g, " ").toLowerCase()}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    />
                  ) : null;
                })}
              </Box>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <InfoOutlinedIcon sx={{ ...iconSx(theme), ...infoIconBox(theme) }} />
            </Box>
            <Box>
              <Typography sx={infoTitle(theme)}>{FORMS.ADD_ROLE.INFO_TITLE}</Typography>
              <Typography sx={infoDesc(theme)}>{FORMS.ADD_ROLE.INFO_DESC}</Typography>
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
                {isLoading ? FORMS.ADD_ROLE.BUTTON_ADDING : FORMS.ADD_ROLE.BUTTON_ADD}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRoleForm;
