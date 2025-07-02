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
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Permission } from "../../models/Permission";
import CustomTextField from "../Textfield/CustomTextField";
import { FORMS } from "../../constants/constants";

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
    <Box sx={{ width: "100%", p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12}>
          <CustomTextField
            label={FORMS.ADD_ROLE.NAME_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_ROLE.NAME_PLACEHOLDER}
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            error={errors.name !== ""}
            helperText={errors.name}
            icon={
              <GroupOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
            }
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={errors.permissions !== ""}>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1,
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                }}
              >
                {FORMS.ADD_ROLE.PERMISSIONS_LABEL}
              </Box>
              {errors.permissions && (
                <Box
                  sx={{
                    color: theme.palette.error.main,
                    fontSize: "0.75rem",
                    mb: 1,
                  }}
                >
                  {errors.permissions}
                </Box>
              )}
            </Box>

            <Box
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: 1,
                p: { xs: 1, sm: 2 },
                backgroundColor: theme.palette.background.paper,
              }}
            >
              {Object.entries(groupedPermissions).map(
                ([category, categoryPermissions]) => (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 1,
                        fontSize: "clamp(0.8rem, 1.25vw, 0.9rem)",
                        textTransform: "capitalize",
                      }}
                    >
                      {category}
                    </Box>
                    <FormGroup row>
                      {categoryPermissions.map((permission) => (
                        <FormControlLabel
                          key={permission.id}
                          control={
                            <Checkbox
                              checked={formData.permissions.includes(
                                permission.id.toString(),
                              )}
                              onChange={() =>
                                handlePermissionChange(permission.id.toString())
                              }
                              sx={{
                                color: theme.palette.primary.main,
                                "&.Mui-checked": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            />
                          }
                          label={
                            <Box
                              sx={{
                                fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                                color: theme.palette.text.primary,
                              }}
                            >
                              {permission.name.replace(/_/g, " ").toLowerCase()}
                            </Box>
                          }
                          sx={{
                            minWidth: { xs: 150, sm: 200 },
                            mr: { xs: 1, sm: 2 },
                            mb: 1,
                          }}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                ),
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
                {FORMS.ADD_ROLE.INFO_TITLE}
              </Box>
              <Box
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                }}
              >
                {FORMS.ADD_ROLE.INFO_DESC}
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
              Limpiar
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
                  Cancelar
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
