import React, { useState, useMemo } from "react";
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
  useMediaQuery,
} from "@mui/material";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Permission } from "../../models/Permission";
import CustomTextField from './CustomTextField';

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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  });
  const [errors, setErrors] = useState({
    name: "",
    permissions: "",
  });

  const groupedPermissions = useMemo(() => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      const category = permission.name.split('_')[0];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  }, [permissions]);

  const validateField = (name: string, value: string | string[]) => {
    if (name === "name") {
      const nameValue = value as string;
      if (!nameValue.trim()) {
        return "El nombre del rol es requerido";
      }
      if (nameValue.trim().length < 2) {
        return "Mínimo 2 caracteres";
      }
      if (nameValue.trim().length > 50) {
        return "Máximo 50 caracteres";
      }
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/;
      if (!nameRegex.test(nameValue)) {
        return "Solo se permiten letras, espacios y guiones";
      }
    }
    
    if (name === "permissions") {
      const permissionsValue = value as string[];
      if (permissionsValue.length === 0) {
        return "Debe seleccionar al menos un permiso";
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
    setFormData({ name: "", permissions: [] });
    setErrors({ name: "", permissions: "" });
  };

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12}>
          <CustomTextField
            label="Nombre del Rol"
            variant="outlined"
            fullWidth
            placeholder="Ej: Administrador"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            error={errors.name !== ""}
            helperText={errors.name}
            icon={<GroupOutlinedIcon sx={{ color: theme.palette.text.secondary }} />}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={errors.permissions !== ""}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
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
              p: { xs: 1, sm: 2 },
              backgroundColor: theme.palette.background.paper,
            }}>
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Box sx={{ 
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 1,
                    fontSize: 'clamp(0.8rem, 1.25vw, 0.9rem)',
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
                            fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                            color: theme.palette.text.primary,
                          }}>
                            {permission.name.replace(/_/g, ' ').toLowerCase()}
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
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
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
                        fontSize: 'clamp(0.625rem, 1vw, 0.75rem)',
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
              p: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Box sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.info.main }}>
              <InfoOutlinedIcon sx={{ color: theme.palette.info.main, mr: { xs: 1, sm: 2 } }} />
            </Box>
            <Box>
              <Box sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}>
                Información del Rol
              </Box>
              <Box sx={{
                color: theme.palette.text.secondary,
                fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
              }}>
                Define el nombre y permisos del nuevo rol. Los permisos determinan qué acciones puede realizar un usuario con este rol en el sistema.
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              gap: { xs: 1, sm: 2 },
              pt: 2,
              borderTop: '1px solid',
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
                fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                order: { xs: 3, sm: 1 },
              }}
            >
              Limpiar
            </Button>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
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
                    fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                startIcon={<PostAddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={{
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                  fontWeight: 600,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                {isLoading ? 'Creando...' : (isSmallScreen ? 'Crear' : 'Crear Rol')}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRoleForm; 