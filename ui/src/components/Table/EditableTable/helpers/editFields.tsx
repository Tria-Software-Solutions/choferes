import React from "react";
import { FormControl, Select, MenuItem, Checkbox, ListItemText, Box, Autocomplete } from "@mui/material";
import TextfieldComponent from "../../../Textfield/Textfield.component";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { translateColumnHeaderToSpanish } from "../../../../utils/string";
import { maskLicensePlate, maskParkingLotWithPrefix } from "../../../../utils/mask";
import { formControlStyles, selectStyles, datePickerTextFieldStyles } from "../EditableTable.styles";
import { ColumnConfigType, PARKING_PREFIX_OPTIONS } from "./columnConfig";
import { DAYS_LIST } from "../../../../constants/constants";
import { datePickerSx } from '../../../../pages/Management/VehiclesPage/styles';

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
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 320,
                overflowY: "auto",
              },
            },
          }}
        >
          {config.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                checked={
                  Array.isArray(selectedValues) &&
                  selectedValues.includes(option.value)
                }
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
        label={translateColumnHeaderToSpanish(column)}
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
        label={translateColumnHeaderToSpanish(column)}
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
      <FormControl variant="outlined" sx={{ ...formControlStyles, width: { xs: "100%", sm: "auto", minWidth: "200px", md: "400px", lg: "850px", xl: "1200px" } }}>
        <Select
          multiple
          value={selectedValues}
          onChange={(e) =>
            setEditField && setEditField(String(column), e.target.value)
          }
          renderValue={(selected) => {
            if (!Array.isArray(selected)) return "";
            const max = 7; // Show all days since we have responsive width
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
            PaperProps: {
              style: {
                maxHeight: 320,
                overflowY: "auto",
              },
            },
          }}
        >
          {dayOptions.map((option: { value: string; label: string }) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                checked={
                  Array.isArray(selectedValues) &&
                  selectedValues.includes(option.value)
                }
              />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
    // Get prefix from editFields or default to ATP
    const parkingPrefix = (editFields["parkingPrefix"] as string) || "ATP";
    const parkingLotValue = (editFields["parkingLot"] as string) || "";
    const prefixOptions = PARKING_PREFIX_OPTIONS.concat(
      parkingPrefix &&
        !PARKING_PREFIX_OPTIONS.some((opt) => opt.value === parkingPrefix)
        ? [{ value: parkingPrefix, label: parkingPrefix }]
        : []
    );

    const handlePrefixChange = (
      event: React.SyntheticEvent,
      newValue: { value: string; label: string } | string | null
    ) => {
      let prefixValue = "";
      if (newValue === null || newValue === "") {
        setEditField && setEditField("parkingPrefix", "");
        setEditField && setEditField("parkingLot", "");
        return;
      }
      if (typeof newValue === "object" && newValue !== null) {
        prefixValue = newValue.value.toUpperCase();
      } else if (typeof newValue === "string") {
        prefixValue = newValue.toUpperCase();
      }
      if (prefixValue) {
        setEditField && setEditField("parkingPrefix", prefixValue);
        if (prefixValue === "CE") {
          setEditField && setEditField("parkingLot", "CE");
        }
      }
    };

    const handleParkingLotChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const rawValue = event.target.value;
      const maskedValue = maskParkingLotWithPrefix(rawValue, parkingPrefix);
      setEditField && setEditField("parkingLot", maskedValue);
    };

    return (
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Autocomplete
          options={prefixOptions}
          value={prefixOptions.find((opt) => opt.value === parkingPrefix) || null}
          onChange={handlePrefixChange}
          renderInput={(params) => (
            <TextfieldComponent
              {...params}
              label="Prefijo"
              sx={{ width: "80px" }}
            />
          )}
          sx={{ width: "80px" }}
        />
        <TextfieldComponent
          label={translateColumnHeaderToSpanish(column)}
          value={parkingLotValue}
          onChange={handleParkingLotChange}
          error={!validateField("parkingLot", parkingLotValue)}
          sx={{ width: "120px" }}
        />
      </Box>
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
              sx: { ...datePickerSx, mt: 0 },
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