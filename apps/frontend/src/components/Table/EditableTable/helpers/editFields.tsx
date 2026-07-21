import React, { useState, useRef } from "react";
import { FormControl, Select, MenuItem, Checkbox, ListItemText } from "@mui/material";
import TextfieldComponent from "../../../Textfield/Textfield.component";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { maskLicensePlate } from "../../../../utils/mask";
import { formControlStyles, selectStyles, datePickerTextFieldStyles, premiumMenuProps } from "../EditableTable.styles";
import { ColumnConfigType } from "./columnConfig";
import { DAYS_LIST } from "../../../../constants/constants";

// Componente wrapper para dropdown de días con posicionamiento dinámico
const DaysDropdown: React.FC<{
  selectedValues: string[];
  onChange: (value: string[]) => void;
  dayOptions: { value: string; label: string }[];
}> = ({ selectedValues, onChange, dayOptions }) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ vertical: 'top' | 'bottom'; horizontal: 'left' }>({
    vertical: 'bottom',
    horizontal: 'left',
  });

  const handleOpen = () => {
    if (!anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const menuHeight = 360; // maxHeight del menu
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Si no hay suficiente espacio abajo, posicionar arriba
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      setMenuPosition({ vertical: 'top', horizontal: 'left' });
    } else {
      setMenuPosition({ vertical: 'bottom', horizontal: 'left' });
    }
  };

  const getTransformOrigin = () => {
    const vertical: 'top' | 'bottom' = menuPosition.vertical === 'bottom' ? 'top' : 'bottom';
    return {
      vertical,
      horizontal: 'left' as const,
    };
  };

  return (
    <FormControl variant="outlined" sx={{ ...formControlStyles, width: { xs: "100%", sm: "auto", minWidth: "200px", md: "400px", lg: "850px", xl: "1200px" } }}>
      <Select
        multiple
        value={selectedValues}
        onChange={(e) => onChange(e.target.value as string[])}
        onOpen={handleOpen}
        ref={anchorRef}
        renderValue={(selected) => {
          if (!Array.isArray(selected)) return "";
          const max = 7;
          const labels = selected.map(
            (v) => dayOptions.find((opt: { value: string; label: string }) => opt.value === v)?.label || v
          );
          const visible = labels.slice(0, max);
          const hidden = labels.length > max ? labels.length - max : 0;
          return hidden > 0
            ? `${visible.join(", ")} +${hidden} más`
            : `${visible.join(", ")}`;
        }}
        sx={selectStyles}
        MenuProps={{
          ...premiumMenuProps,
          anchorOrigin: menuPosition,
          transformOrigin: getTransformOrigin(),
        }}
      >
        {dayOptions.map((option: { value: string; label: string }) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox
              checked={
                Array.isArray(selectedValues) &&
                selectedValues.includes(option.value)
              }
              color="primary"
            />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// This function is generic and can be used in EditableTable
export function renderEditField<T extends object>({
  column,
  value,
  editFields,
  setEditField,
  validateField,
  columnConfig,
}: {
  column: keyof T;
  value: string;
  editFields: Record<string, string | boolean | number | string[] | Date>;
  setEditField?: (
    field: string,
    value: string | boolean | number | string[] | Date
  ) => void;
  validateField: (field: string, value: string | string[] | boolean) => boolean;
  columnConfig: Record<string, ColumnConfigType>;
}) {
  const config = columnConfig[String(column)];

  if (column === "permissionNames" && config && config.options) {
    const selectedValues: string[] = Array.isArray(editFields[String(column)])
      ? (editFields[String(column)] as string[])
      : [];
    return (
      <FormControl variant="outlined" sx={{ ...formControlStyles, width: "1200px" }}>
        <Select
          multiple
          value={selectedValues}
          onChange={(e) =>
            setEditField && setEditField(String(column), e.target.value)
          }
          renderValue={(selected) => {
            if (!Array.isArray(selected)) return "";
            const max = 5;
            const labels = selected.map(
              (v) => config.options?.find((opt) => opt.value === v)?.label || v
            );
            const visible = labels.slice(0, max);
            const hidden = labels.length > max ? labels.length - max : 0;
            return hidden > 0
              ? `${visible.join(", ")} +${hidden} más`
              : `${visible.join(", ")}`;
          }}
          sx={selectStyles}
          MenuProps={premiumMenuProps}
        >
          {config.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                checked={
                  Array.isArray(selectedValues) &&
                  selectedValues.includes(option.value)
                }
                color="primary"
              />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (String(column) === "licensePlate") {
    const licensePlateValue = (editFields["licensePlate"] as string) || "";
    const handleLicensePlateChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const rawValue = event.target.value;
      const maskedValue = maskLicensePlate(rawValue);
      setEditField && setEditField("licensePlate", maskedValue);
    };
    return (
      <TextfieldComponent
        value={licensePlateValue}
        onChange={handleLicensePlateChange}
        error={!validateField("licensePlate", licensePlateValue)}
        sx={{ width: "120px" }}
      />
    );
  }

  if (String(column) === "ticket") {
    return (
      <TextfieldComponent
        value={editFields[String(column)] || ""}
        onChange={(e) =>
          setEditField && setEditField(String(column), e.target.value)
        }
        error={!validateField(String(column), value)}
        sx={{ width: "80px" }}
      />
    );
  }

  if (String(column) === "hours") {
    return (
      <TextfieldComponent
        type="number"
        value={editFields[String(column)] || ""}
        onChange={(e) =>
          setEditField && setEditField(String(column), e.target.value)
        }
        error={!validateField(String(column), value)}
        sx={{ width: "80px" }}
        inputProps={{ min: "0" }}
      />
    );
  }

  if (String(column) === "name") {
    return (
      <TextfieldComponent
        value={editFields[String(column)] || ""}
        onChange={(e) =>
          setEditField && setEditField(String(column), e.target.value)
        }
        error={!validateField(String(column), value)}
        sx={{ width: "200px" }}
      />
    );
  }

  if (String(column) === "permissionNames") {
    return (
      <TextfieldComponent
        value={editFields[String(column)] || ""}
        onChange={(e) =>
          setEditField && setEditField(String(column), e.target.value)
        }
        error={!validateField(String(column), value)}
        sx={{ width: "150px" }}
      />
    );
  }

  if (String(column) === "days") {
    const selectedValues: string[] = Array.isArray(editFields[String(column)])
      ? (editFields[String(column)] as string[])
      : [];

    // Use the existing DAYS_LIST constant which already has English values and Spanish labels
    const dayOptions = DAYS_LIST;

    return (
      <DaysDropdown
        selectedValues={selectedValues}
        onChange={(value) => setEditField && setEditField(String(column), value)}
        dayOptions={dayOptions}
      />
    );
  }

  if (!config) {
    return (
      <TextfieldComponent
        fullWidth
        value={editFields[String(column)] || ""}
        onChange={(e) =>
          setEditField && setEditField(String(column), e.target.value)
        }
        error={!validateField(String(column), value)}
      />
    );
  }

  if (String(column) === "parkingLot") {
    const parkingLotValue = (editFields["parkingLot"] as string) || "";

    const handleParkingLotChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const rawValue = event.target.value;
      setEditField && setEditField("parkingLot", rawValue);
    };

    return (
      <TextfieldComponent
        value={parkingLotValue}
        onChange={handleParkingLotChange}
        error={!validateField("parkingLot", parkingLotValue)}
        sx={{ width: "120px" }}
      />
    );
  }

  if (String(column) === "parkingDate") {
    let dateValue = editFields[String(column)];
    if (typeof dateValue === 'string') {
      dateValue = new Date(dateValue);
    }
    const handleDateChange = (date: Date | null) => {
      setEditField && setEditField(String(column), date || new Date());
    };
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          value={dateValue as Date}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              variant: 'outlined',
              ...datePickerTextFieldStyles,
              error: !validateField(String(column), value),
            } as Record<string, unknown>,
          }}
        />
      </LocalizationProvider>
    );
  }

  if (config.type === "select" && config.options) {
    return (
      <FormControl variant="outlined" sx={formControlStyles}>
        <Select
          value={editFields[String(column)] || ""}
          onChange={(e) =>
            setEditField && setEditField(String(column), e.target.value)
          }
          sx={selectStyles}
          MenuProps={premiumMenuProps}
        >
          {config.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (config.type === "date") {
    const dateValue = editFields[String(column)] as Date | undefined;
    const handleDateChange = (date: Date | null) => {
      setEditField && setEditField(String(column), date || new Date());
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          value={dateValue}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              ...datePickerTextFieldStyles,
              error: !validateField(String(column), value),
            } as Record<string, unknown>,
          }}
        />
      </LocalizationProvider>
    );
  }

  return (
    <TextfieldComponent
      fullWidth
      value={editFields[String(column)] || ""}
      onChange={(e) =>
        setEditField && setEditField(String(column), e.target.value)
      }
      error={!validateField(String(column), value)}
    />
  );
} 