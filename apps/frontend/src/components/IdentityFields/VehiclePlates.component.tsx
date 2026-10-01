import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBike,
  IconBus,
  IconCar,
  IconMotorbike,
  IconPlus,
  IconTruck,
} from "@tabler/icons-react";
import {
  DEFAULT_VEHICLE_TYPE,
  MAX_PLATES_PER_EMPLOYEE,
  RESTRICTION_HOURS,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  VehicleType,
  formatPlate,
  getPlateRestriction,
  isValidPlate,
  normalizePlate,
} from "@choferes/shared";

export interface VehicleEntry {
  plate: string;
  type: VehicleType;
}

const VEHICLE_ICONS: Record<VehicleType, React.ReactNode> = {
  car: <IconCar size={18} stroke={1.75} />,
  moto: <IconMotorbike size={18} stroke={1.75} />,
  bus: <IconBus size={18} stroke={1.75} />,
  truck: <IconTruck size={18} stroke={1.75} />,
  bike: <IconBike size={18} stroke={1.75} />,
};

interface VehiclePlatesProps {
  vehicles: VehicleEntry[];
  /** Con `onChange` se pueden agregar y quitar vehículos; sin él es solo lectura. */
  onChange?: (vehicles: VehicleEntry[]) => void;
  disabled?: boolean;
}

const VehiclePlates: React.FC<VehiclePlatesProps> = ({ vehicles, onChange, disabled }) => {
  const { colors } = useTheme().tokens;
  const [draftPlate, setDraftPlate] = useState("");
  const [draftType, setDraftType] = useState<VehicleType>(DEFAULT_VEHICLE_TYPE);
  const [error, setError] = useState("");
  const editable = Boolean(onChange) && !disabled;

  const add = () => {
    const plate = normalizePlate(draftPlate);
    if (!plate) return;
    if (!isValidPlate(plate)) {
      setError("La placa debe tener entre 3 y 10 letras o números");
      return;
    }
    if (vehicles.some((v) => v.plate === plate)) {
      setError("Esa placa ya está registrada");
      return;
    }
    if (vehicles.length >= MAX_PLATES_PER_EMPLOYEE) {
      setError(`Máximo ${MAX_PLATES_PER_EMPLOYEE} vehículos`);
      return;
    }
    onChange?.([...vehicles, { plate, type: draftType }]);
    setDraftPlate("");
    setDraftType(DEFAULT_VEHICLE_TYPE);
    setError("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {vehicles.length === 0 && !editable && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Sin vehículos registrados
        </Typography>
      )}

      {vehicles.map((entry) => {
        const restriction = getPlateRestriction(entry.plate);
        const restricted = restriction.restrictedOn;
        const vehicleType = (VEHICLE_TYPES.includes(entry.type as VehicleType)
          ? entry.type
          : DEFAULT_VEHICLE_TYPE) as VehicleType;
        return (
          <Box
            key={entry.plate}
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
              {VEHICLE_ICONS[vehicleType]}
            </Box>
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em" }}>
                  {formatPlate(entry.plate)}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
                  {VEHICLE_TYPE_LABELS[vehicleType]}
                </Typography>
              </Box>
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
                onClick={() => onChange?.(vehicles.filter((v) => v.plate !== entry.plate))}
                sx={{ textTransform: "none", color: "text.secondary" }}
              >
                Quitar
              </Button>
            )}
          </Box>
        );
      })}

      {editable && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {/* Los tres controles miden 40px (size="small" + height del botón),
              así que van centrados en el mismo row. El mensaje va debajo: si
              fuera helperText del TextField su caja crecería y descuadraría
              la fila. */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <Select
              size="small"
              value={draftType}
              onChange={(e) => setDraftType(e.target.value as VehicleType)}
              sx={{ minWidth: 130, flexShrink: 0 }}
              renderValue={(v) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {VEHICLE_ICONS[v as VehicleType]}
                  <Typography sx={{ fontSize: "0.875rem" }}>
                    {VEHICLE_TYPE_LABELS[v as VehicleType]}
                  </Typography>
                </Box>
              )}
            >
              {VEHICLE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {VEHICLE_ICONS[type]}
                    {VEHICLE_TYPE_LABELS[type]}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              value={draftPlate}
              onChange={(event) => {
                setDraftPlate(normalizePlate(event.target.value));
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
              inputProps={{ maxLength: 10, "aria-label": "Placa del vehículo" }}
              sx={{ flex: 1, minWidth: 140 }}
            />
            <Button
              variant="outlined"
              size="medium"
              startIcon={<IconPlus size={16} />}
              onClick={add}
              disabled={!draftPlate}
              sx={{ textTransform: "none", fontWeight: 600, height: 40, flexShrink: 0 }}
            >
              Agregar
            </Button>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: error !== "" ? "error.main" : "text.secondary", lineHeight: 1.4 }}
          >
            {error || "El último dígito define el día de restricción."}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VehiclePlates;
