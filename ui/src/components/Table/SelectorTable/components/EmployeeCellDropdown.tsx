import React, { useState } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Theme,
  IconButton,
  InputBase,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import PlusIcon from "@mui/icons-material/Add";
import { SELECTOR_TABLE } from "../../../../constants/constants";

interface EmployeeCellDropdownProps {
  value: string;
  options: Array<{ id: number; label: string; specialSchedule?: boolean }>;
  disabled?: boolean;
  onChange: (value: string) => void;
  theme: Theme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
  onAddSchedule?: () => void;
}

export const EmployeeCellDropdown: React.FC<EmployeeCellDropdownProps> = ({
  value,
  options,
  disabled = false,
  onChange,
  theme,
  styles,
  onAddSchedule,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const open = Boolean(anchorEl);

  // Detectar si hay suficiente espacio abajo
  const getAnchorPosition = () => {
    if (!anchorEl) return { vertical: "bottom" as const, horizontal: "left" as const };
    
    const rect = anchorEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const menuHeight = 400; // maxHeight del menu
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Si no hay suficiente espacio abajo, posicionar arriba
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      return { vertical: "top" as const, horizontal: "left" as const };
    }
    
    return { vertical: "bottom" as const, horizontal: "left" as const };
  };

  const getTransformPosition = () => {
    const anchorPos = getAnchorPosition();
    const vertical: "top" | "bottom" = anchorPos.vertical === "bottom" ? "top" : "bottom";
    return {
      vertical,
      horizontal: "left" as const,
    };
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchValue("");
  };

  const handleClear = () => {
    setSearchValue("");
    onChange(SELECTOR_TABLE.UNASSIGNED);
    handleClose();
  };

  const handleSelect = (label: string) => {
    onChange(label);
    handleClose();
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group options by type
  const regularOptions = filteredOptions.filter((option) => !option.specialSchedule);
  const specialOptions = filteredOptions.filter((option) => option.specialSchedule);

  const renderValue = () => {
    if (value === SELECTOR_TABLE.UNASSIGNED) {
      return (
        <span
          style={{
            color: "#9E9E9E",
            fontSize: "0.85rem",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            textAlign: "center",
          }}
        >
          {SELECTOR_TABLE.UNASSIGNED}
        </span>
      );
    }
    return value;
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          minHeight: 40,
          padding: "8px 12px",
          cursor: disabled ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          borderRadius: "8px",
          "&:hover": !disabled
            ? {
                backgroundColor: theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
              }
            : {},
        }}
      >
        {renderValue()}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={getTransformPosition()}
        anchorOrigin={getAnchorPosition()}
        disableAutoFocusItem
        disableEnforceFocus
        autoFocus={false}
        MenuListProps={{
          disablePadding: false,
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 0.5,
            minWidth: 200,
            maxHeight: 400,
            background: theme.palette.mode === "dark"
              ? "rgba(30, 30, 35, 0.95)"
              : "#ffffff",
            backdropFilter: "blur(20px)",
            border: "none",
            borderRadius: "16px",
            boxShadow: theme.palette.mode === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.5)"
              : "0 8px 32px rgba(0, 0, 0, 0.12)",
            overflow: "hidden",
            padding: 0,
            "& .MuiList-root": {
              padding: 0,
            },
          },
        }}
      >
        <Box sx={{ maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
          {/* Header sticky con búsqueda */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 35, 0.95)'
                : '#ffffff',
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <InputBase
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              sx={{
                flex: 1,
                fontSize: '0.875rem',
                '& input': {
                  padding: 0,
                },
              }}
            />
            {searchValue && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchValue("");
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          {/* Options con scroll */}
          <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
            {regularOptions.length > 0 && (
              <>
                <Typography
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.light 
                      : theme.palette.primary.main,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.2) 0%, rgba(25, 118, 210, 0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(25, 118, 210, 0.04) 100%)',
                    borderLeft: `3px solid ${theme.palette.mode === 'dark' 
                      ? theme.palette.primary.light 
                      : theme.palette.primary.main}`,
                    ml: 1,
                  }}
                >
                  Ubicaciones
                </Typography>
                {regularOptions.map((option, index) => {
                  const isSelected = option.label === value;
                  return (
                    <React.Fragment key={option.id}>
                      <MenuItem
                        onClick={() => handleSelect(option.label)}
                        sx={{
                          py: 1,
                          px: 2,
                          my: 0,
                          margin: 0,
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          color: theme.palette.text.primary,
                          "&:hover": {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.04)",
                            transform: "translateX(2px)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{option.label}</Typography>
                          </Box>
                          {isSelected && (
                            <CheckIcon
                              sx={{
                                fontSize: 18,
                                color: theme.palette.primary.main,
                              }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                      {index < regularOptions.length - 1 && (
                        <Divider
                          sx={{
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            my: 0,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}

            {specialOptions.length > 0 && regularOptions.length > 0 && (
              <Divider
                sx={{
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  my: 1,
                  mx: 2,
                }}
              />
            )}

            {specialOptions.length > 0 && (
              <>
                <Typography
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark'
                      ? '#FF9800'
                      : '#E65100',
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.25) 0%, rgba(255, 152, 0, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(230, 81, 0, 0.15) 0%, rgba(230, 81, 0, 0.05) 100%)',
                    borderLeft: `4px solid ${theme.palette.mode === 'dark'
                      ? '#FF9800'
                      : '#E65100'}`,
                    ml: 1,
                    borderRadius: '0 8px 8px 0',
                  }}
                >
                  Horarios Especiales
                </Typography>
                {specialOptions.map((option, index) => {
                  const isSelected = option.label === value;
                  return (
                    <React.Fragment key={option.id}>
                      <MenuItem
                        onClick={() => handleSelect(option.label)}
                        sx={{
                          py: 1,
                          px: 2,
                          my: 0,
                          margin: 0,
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          color: theme.palette.text.primary,
                          "&:hover": {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.04)",
                            transform: "translateX(2px)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{option.label}</Typography>
                          </Box>
                          {isSelected && (
                            <CheckIcon
                              sx={{
                                fontSize: 18,
                                color: theme.palette.primary.main,
                              }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                      {index < specialOptions.length - 1 && (
                        <Divider
                          sx={{
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            my: 0,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}

            {onAddSchedule && (
              <>
                <Divider
                  sx={{
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                    my: 1,
                    mx: 2,
                  }}
                />
                <MenuItem
                  onClick={() => {
                    handleClose();
                    onAddSchedule();
                  }}
                  sx={{
                    py: 1.25,
                    px: 2,
                    my: 0,
                    margin: 0,
                    mx: 1,
                    mb: 1,
                    borderRadius: '8px',
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(25, 118, 210, 0.2)"
                          : "rgba(25, 118, 210, 0.12)",
                      transform: "translateX(4px)",
                      boxShadow: theme.palette.mode === "dark"
                        ? "0 4px 12px rgba(25, 118, 210, 0.3)"
                        : "0 4px 12px rgba(25, 118, 210, 0.2)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <PlusIcon sx={{ fontSize: 20, fontWeight: 700 }} />
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>Agregar horario</Typography>
                  </Box>
                </MenuItem>
              </>
            )}
          </Box>

          {/* Footer con botón de limpiar */}
          {value !== SELECTOR_TABLE.UNASSIGNED && (
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                display: 'flex',
                justifyContent: 'flex-end',
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 35, 0.95)'
                  : '#ffffff',
              }}
            >
              <Typography
                variant="body2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                sx={{
                  color: 'error.main',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Limpiar selección
              </Typography>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
};
