import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  useTheme,
} from "@mui/material";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Permission } from "../../models/Permission";

interface AddRoleFormProps {
  onSubmit: (role: { 
    name: string; 
    permissions: string[]; 
  }) => void;
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
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  });
  const [errors, setErrors] = useState({
    name: "",
    permissions: "",
  });

  const validateField = (name: string, value: string | string[]) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
    
    if (name === "permissions") {
      if ((value as string[]).length === 0) {
        return "Debe seleccionar al menos un permiso";
      }
      return "";
    }
    
    if (!value || (typeof value === "string" && !value.trim())) {
      return "Este campo es requerido";
    }
    
    if (typeof value === "string") {
      switch (name) {
        case "name":
          if (!nameRegex.test(value)) {
            return "Solo se permiten letras, espacios y guiones";
          }
          if (value.trim().length < 2) {
            return "Mínimo 2 caracteres";
          }
          if (value.trim().length > 50) {
            return "Máximo 50 caracteres";
          }
          break;
      }
    }
    
    return "";
  };

  const handleFieldChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handlePermissionChange = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter(id => id !== permissionId)
      : [...formData.permissions, permissionId];
    
    handleFieldChange("permissions", newPermissions);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.permissions.length > 0 &&
      errors.name === "" &&
      errors.permissions === ""
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit({
        name: formData.name.trim(),
        permissions: formData.permissions,
      });
    }
  };

  const handleClearForm = () => {
    setFormData({
      name: "",
      permissions: [],
    });
    setErrors({
      name: "",
      permissions: "",
    });
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.name.split('_')[0] || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12}>
          <TextField
            label="Nombre del Rol"
            variant="outlined"
            fullWidth
            placeholder="Ej: Administrador"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            error={errors.name !== ""}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  👥
                </Box>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={errors.permissions !== ""}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
              }}>
                Permisos del Rol
              </Box>
              {errors.permissions && (
                <Box sx={{ color: theme.palette.error.main, fontSize: '0.75rem', mb: 1 }}>
                  {errors.permissions}
                </Box>
              )}
            </Box>
            
            <Box sx={{ 
              maxHeight: 300, 
              overflowY: 'auto',
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: 1,
              p: 2,
              backgroundColor: theme.palette.background.paper,
            }}>
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Box sx={{ 
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 1,
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                  }}>
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
                            sx={{
                              color: theme.palette.primary.main,
                              '&.Mui-checked': {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ 
                            fontSize: '0.875rem',
                            color: theme.palette.text.primary,
                          }}>
                            {permission.name.replace(/_/g, ' ').toLowerCase()}
                          </Box>
                        }
                        sx={{ 
                          minWidth: 200,
                          mr: 2,
                          mb: 1,
                        }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              ))}
            </Box>
          </FormControl>
        </Grid>

        {formData.permissions.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
              }}>
                Permisos Seleccionados ({formData.permissions.length})
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.permissions.map((permissionId) => {
                  const permission = permissions.find(p => p.id.toString() === permissionId);
                  return permission ? (
                    <Chip
                      key={permissionId}
                      label={permission.name.replace(/_/g, ' ').toLowerCase()}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
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
              display: 'flex',
              alignItems: 'center',
              p: 2,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Box sx={{ mr: 2, color: theme.palette.info.main }}>
              ℹ️
            </Box>
            <Box>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}>
                Información del Rol
              </Box>
              <Box sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
              }}>
                Define el nombre, descripción y permisos del nuevo rol. Los permisos determinan qué acciones puede realizar un usuario con este rol en el sistema.
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
            >
              Limpiar
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                startIcon={<PostAddRoundedIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                {isLoading ? 'Creando...' : 'Crear Rol'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRoleForm; 