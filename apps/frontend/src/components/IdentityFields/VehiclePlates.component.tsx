import React, { useState } from "react";
import { Box, Button, Chip, TextField, Typography, useTheme } from "@mui/material";
import { IconCar, IconPlus } from "@tabler/icons-react";
import {
  MAX_PLATES_PER_EMPLOYEE,
  RESTRICTION_HOURS,
  formatPlate,
  getPlateRestriction,
  isValidPlate,
  normalizePlate,
} from "@choferes/shared";

interface VehiclePlatesProps {
  plates: string[];
  /** Con `onChange` se pueden agregar y quitar placas; sin él es solo lectura. */
  onChange?: (plates: string[]) => void;
  disabled?: boolean;
}

// Placas de los vehículos propios del empleado y su restricción vehicular
// (hoy no circula de San José: de lunes a viernes, 6:00–19:00, según el último
// dígito de la placa).
const VehiclePlates: React.FC<VehiclePlatesProps> = ({ plates, onChange, disabled }) => {
  const { colors } = useTheme().tokens;
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const editable = Boolean(onChange) && !disabled;

  const add = () => {
    const plate = normalizePlate(draft);
    if (!plate) return;
    if (!isValidPlate(plate)) {
      setError("La placa debe tener entre 3 y 10 letras o números");
      return;
    }
    if (plates.includes(plate)) {
      setError("Esa placa ya está registrada");
      return;
    }
    if (plates.length >= MAX_PLATES_PER_EMPLOYEE) {
      setError(`Máximo ${MAX_PLATES_PER_EMPLOYEE} placas`);
      return;
    }
    onChange?.([...plates, plate]);
    setDraft("");
    setError("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {plates.length === 0 && !editable && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Sin vehículos registrados
        </Typography>
      )}

      {plates.map((plate) => {
        const restriction = getPlateRestriction(plate);
        const restricted = restriction.restrictedOn;
        return (
          <Box
            key={plate}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexWrap: "wrap",
              p: 1.25,
              borderRadius: "12px",
              border: `1px solid ${restricted ? `${colors.warning}55` : colors.divider}`,
              backgroundColor: restricted ? colors.warningSoft : "transparent",
            }}
          >
            <Box
              aria-hidden
              sx={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 32,
                borderRadius: "9px",
                color: restricted ? colors.warningDark : "text.secondary",
                backgroundColor: restricted ? `${colors.warning}26` : colors.hover,
              }}
            >
              <IconCar size={18} stroke={1.75} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em" }}>
                {formatPlate(plate)}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                {restriction.dayName
                  ? `No circula los ${restriction.dayName}, de ${RESTRICTION_HOURS.from} a ${RESTRICTION_HOURS.to}`
                  : "No se puede determinar el día de restricción"}
              </Typography>
            </Box>
            {restriction.dayName && (
              <Chip
                size="small"
                label={restricted ? "Restringido hoy" : "Sin restricción hoy"}
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: restricted ? colors.warningDark : colors.successDark,
                  backgroundColor: restricted ? `${colors.warning}26` : colors.successSoft,
                }}
              />
            )}
            {editable && (
              <Button
                size="small"
                variant="text"
                color="inherit"
                onClick={() => onChange?.(plates.filter((item) => item !== plate))}
                sx={{ textTransform: "none", color: "text.secondary" }}
              >
                Quitar
              </Button>
            )}
          </Box>
        );
      })}

      {editable && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            size="small"
            value={draft}
            onChange={(event) => {
              setDraft(normalizePlate(event.target.value));
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
            placeholder="Ej: BCD123"
            error={error !== ""}
            helperText={error || "El último dígito define el día de restricción."}
            inputProps={{ maxLength: 10, "aria-label": "Placa del vehículo" }}
            sx={{ flex: 1, maxWidth: 260 }}
          />
          <Button
            variant="outlined"
            size="medium"
            startIcon={<IconPlus size={16} />}
            onClick={add}
            disabled={!draft}
            sx={{ textTransform: "none", fontWeight: 600, height: 40 }}
          >
            Agregar
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default VehiclePlates;
