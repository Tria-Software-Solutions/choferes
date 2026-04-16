import React, { useState, useCallback, useEffect, useRef } from "react";
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
import type { Employee } from "../../../../models/Employee";
import type { Schedule } from "../../../../models/Schedule";
import { SELECTOR_TABLE } from "../../../../constants/constants";
import { useSpeechRecognition } from "../../../../hooks/useSpeechRecognition";
import MicIcon from "@mui/icons-material/Mic";

interface ScheduleCellDropdownProps {
  assignedEmployees: Employee[];
  filteredEmployees: Employee[];
  canEdit?: boolean;
  employeeSearchTerms: Record<string, string>;
  onScheduleEmployeesChange: (
    value: number[],
    scheduleId: number,
    date: string
  ) => void;
  onSearchChange: (scheduleId: number, date: string, value: string) => void;
  scheduleForDay: Schedule;
  date: string;
  theme: Theme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
}

export const ScheduleCellDropdown: React.FC<ScheduleCellDropdownProps> = ({
  assignedEmployees,
  filteredEmployees,
  canEdit,
  employeeSearchTerms,
  onScheduleEmployeesChange,
  onSearchChange,
  scheduleForDay,
  date,
  theme,
  styles,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const open = Boolean(anchorEl);
  const { isListening, transcript, startListening, stopListening, isSupported, isInitializing, audioStream } = useSpeechRecognition();
  const lastProcessedTranscriptRef = useRef<string>("");
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Configurar analizador de audio para visualizador de decibeles
  useEffect(() => {
    if (audioStream && isListening) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(audioStream);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calcular nivel promedio
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setAudioLevel(average);
        }
        
        if (isListening) {
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();

      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }
  }, [audioStream, isListening]);

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
    if (!canEdit) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchValue("");
  };

  const handleToggleEmployee = (employeeId: number) => {
    const currentIds = assignedEmployees.map((e) => e.id);
    const newIds = currentIds.includes(employeeId)
      ? currentIds.filter((id) => id !== employeeId)
      : [...currentIds, employeeId];

    onScheduleEmployeesChange(newIds, scheduleForDay.id, date);
  };

  const handleClear = () => {
    setSearchValue("");
    onScheduleEmployeesChange([], scheduleForDay.id, date);
    lastProcessedTranscriptRef.current = "";
    // Detener el reconocimiento de voz si está activo
    if (isListening) {
      stopListening();
    }
    handleClose();
  };

  const getFilteredEmployees = useCallback(() => {
    const term = searchValue.toLowerCase();
    return filteredEmployees
      .filter((emp) =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term)
      )
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
          "es",
          { sensitivity: "base" }
        )
      );
  }, [filteredEmployees, searchValue]);

  const filteredList = getFilteredEmployees();

  // Procesar transcript de voz y seleccionar empleados coincidentes
  useEffect(() => {
    if (transcript && isSupported) {
      const spokenText = transcript.toLowerCase().trim();
      if (!spokenText) return;

      // Verificar si hay nuevas palabras desde la última vez
      const lastProcessed = lastProcessedTranscriptRef.current;
      const isNewTranscript = spokenText !== lastProcessed;

      if (!isNewTranscript) return;

      // Dividir el texto en palabras individuales
      const words = spokenText.split(/\s+/).filter(w => w.length > 0);

      // Obtener las palabras nuevas (las que no estaban en el último transcript procesado)
      const lastWords = lastProcessed.split(/\s+/).filter(w => w.length > 0);
      const newWords = words.filter(word => !lastWords.includes(word));

      // Buscar empleados que coincidan con las palabras nuevas
      // Primero verificar si la combinación de palabras forma un nombre completo
      const spokenPhrase = newWords.join(' ').toLowerCase();
      const fullNameMatches = filteredEmployees
        .filter((emp) => {
          const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
          return spokenPhrase === fullName;
        })
        .map((emp) => emp.id);

      // Si hay coincidencias de nombre completo, usar solo esas
      if (fullNameMatches.length > 0) {
        const currentIds = assignedEmployees.map((e) => e.id);
        const newIds = [...new Set([...currentIds, ...fullNameMatches])];
        onScheduleEmployeesChange(newIds, scheduleForDay.id, date);
        lastProcessedTranscriptRef.current = spokenText;
        return;
      }

      // Si no hay coincidencias de nombre completo, buscar coincidencias de nombre o apellido individual
      const nameMatches = filteredEmployees
        .filter((emp) => {
          const firstName = emp.firstName.toLowerCase();
          const lastName = emp.lastName.toLowerCase();

          return newWords.some((word) => word === firstName || word === lastName);
        })
        .map((emp) => emp.id);

      if (nameMatches.length > 0) {
        const currentIds = assignedEmployees.map((e) => e.id);
        const newIds = [...new Set([...currentIds, ...nameMatches])];
        onScheduleEmployeesChange(newIds, scheduleForDay.id, date);
      }

      // Marcar este transcript como procesado
      lastProcessedTranscriptRef.current = spokenText;
    }
  }, [transcript, filteredEmployees, assignedEmployees, scheduleForDay.id, date, onScheduleEmployeesChange, isSupported]);

  const renderValue = () => {
    if (assignedEmployees.length === 0) {
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

    const names = assignedEmployees
      .map((e) => `${e.firstName} ${e.lastName}`)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    return (
      <Box sx={styles.namesContainer}>
        {names.map((name, index) => (
          <Box key={index} sx={styles.employeeChip}>
            <Typography variant="body2" sx={styles.employeeName}>
              {name}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          minHeight: 40,
          padding: "8px 12px",
          cursor: canEdit ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          borderRadius: "8px",
          "&:hover": canEdit
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
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 0.5,
            minWidth: 240,
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
              placeholder={SELECTOR_TABLE.SEARCH_EMPLOYEE_PLACEHOLDER}
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
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              sx={{
                color: isInitializing ? 'text.secondary' : (isListening ? '#4CAF50' : 'text.secondary'),
                backgroundColor: isInitializing ? 'rgba(0, 0, 0, 0.04)' : (isListening ? 'rgba(76, 175, 80, 0.1)' : 'transparent'),
                '&:hover': {
                  color: isInitializing ? 'text.secondary' : (isListening ? '#4CAF50' : 'primary.main'),
                  backgroundColor: isInitializing ? 'rgba(0, 0, 0, 0.08)' : (isListening ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0, 0, 0, 0.04)'),
                },
                animation: isListening ? 'pulse 1.5s infinite' : (isInitializing ? 'spin 1s linear infinite' : 'none'),
                '@keyframes pulse': {
                  '0%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              disabled={!isSupported || isInitializing}
              title={isInitializing ? 'Inicializando...' : (isListening ? 'Escuchando... (hable ahora)' : 'Activar reconocimiento de voz')}
            >
              {isInitializing ? (
                <Box sx={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{
                    width: 14,
                    height: 14,
                    border: '2px solid',
                    borderColor: 'text.secondary',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }} />
                </Box>
              ) : (
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MicIcon sx={{ fontSize: 18 }} />
                  {isListening && audioLevel > 10 && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: -2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '1px',
                      alignItems: 'flex-end',
                      height: 8,
                    }}>
                      {[...Array(5)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 2,
                            height: `${Math.min(100, (audioLevel / 50) * 100)}%`,
                            backgroundColor: '#4CAF50',
                            borderRadius: '1px',
                            transition: 'height 0.1s ease',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </IconButton>
          </Box>

          {/* Employee options con scroll */}
          <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
            {filteredList.map((employee, index) => {
              const isSelected = assignedEmployees.some((e) => e.id === employee.id);
              return (
                <React.Fragment key={employee.id}>
                  <MenuItem
                    onClick={() => handleToggleEmployee(employee.id)}
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
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        >
                          {employee.firstName} {employee.lastName}
                        </Typography>
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
                  {index < filteredList.length - 1 && (
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
          </Box>

          {/* Footer con botón de limpiar */}
          {assignedEmployees.length > 0 && (
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
