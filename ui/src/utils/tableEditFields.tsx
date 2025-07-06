import React from "react";
import { FormControl, Select, MenuItem, Checkbox, ListItemText, Box, Autocomplete, Typography } from "@mui/material";
import TextfieldComponent from "../components/Textfield/Textfield.component";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { translateColumnHeaderToSpanish } from "./string";
import { maskLicensePlate, maskParkingLotWithPrefix } from "./mask";
import { formControlStyles, selectStyles, datePickerTextFieldStyles } from "../components/Table/EditableTable/EditableTable.styles";
import { ColumnConfigType, PARKING_PREFIX_OPTIONS } from "./tableConfig";

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
      <FormControl variant="outlined" fullWidth sx={formControlStyles}>
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
              ? `Permisos: ${visible.join(", ")} +${hidden} más`
              : `Permisos: ${visible.join(", ")}`;
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
        } else {
          setEditField && setEditField("parkingLot", "");
        }
      }
    };

    const handleParkingLotChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const rawValue = event.target.value;
      const maskedValue = maskParkingLotWithPrefix(parkingPrefix, rawValue);
      setEditField && setEditField("parkingLot", maskedValue);
    };

    const isReadOnly = parkingPrefix === "CE";

    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <FormControl
          variant="outlined"
          sx={{ minWidth: 70, flex: "0 0 70px" }}
        >
          <Autocomplete
            freeSolo
            value={{ value: parkingPrefix, label: parkingPrefix }}
            onChange={handlePrefixChange}
            inputValue={parkingPrefix}
            onInputChange={(e, v) =>
              setEditField && setEditField("parkingPrefix", v.toUpperCase())
            }
            options={prefixOptions.map((opt) => ({
              value: opt.value.toUpperCase(),
              label: opt.label.toUpperCase(),
            }))}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.label
            }
            noOptionsText="Sin coincidencias"
            renderInput={(params) => (
              <TextfieldComponent
                {...params}
                label="Prefijo"
                variant="outlined"
                sx={{ minWidth: 70 }}
              />
            )}
          />
        </FormControl>
        <TextfieldComponent
          label={translateColumnHeaderToSpanish(column)}
          variant="outlined"
          value={parkingLotValue}
          onChange={handleParkingLotChange}
          InputProps={{ readOnly: isReadOnly }}
          error={!validateField("parkingLot", parkingLotValue)}
          sx={{ width: "100px" }}
        />
      </Box>
    );
  }

  if (config.type === "date") {
    const handleDateChange = (date: Date | null) => {
      if (date) {
        setEditField && setEditField(String(column), date);
      }
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          label={translateColumnHeaderToSpanish(column)}
          value={
            editFields[String(column)]
              ? (() => {
                  const rawValue = editFields[String(column)];
                  const dateStr =
                    typeof rawValue === "string"
                      ? rawValue
                      : rawValue instanceof Date
                        ? rawValue.toISOString()
                        : "";

                  if (!dateStr) return null;

                  const [year, month, day] = dateStr.split("T")[0].split("-");
                  return new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day)
                  );
                })()
              : null
          }
          sx={{ width: "100%" }}
          maxDate={new Date()}
          views={["year", "month", "day"]}
          slots={{
            toolbar: () => null,
          }}
          slotProps={{
            textField: {
              variant: "outlined",
              fullWidth: true,
              inputProps: { readOnly: true },
              onMouseDown: (e) => e.preventDefault(),
              sx: datePickerTextFieldStyles,
            },
            actionBar: {
              actions: [],
            },
          }}
          closeOnSelect
          onChange={(date) => handleDateChange(date)}
        />
      </LocalizationProvider>
    );
  }

  if (config.type === "select" && config.options) {
    const selectedValue = config.options.some(
      (opt) => opt.value === editFields[String(column)]
    )
      ? editFields[String(column)]
      : "";

    return (
      <FormControl variant="outlined" fullWidth sx={formControlStyles}>
        <Select
          value={selectedValue}
          onChange={(e) =>
            setEditField &&
            setEditField(String(column), String(e.target.value))
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

  if (config.type === "select multiple" && config.options) {
    const selectedValues = Array.isArray(editFields[String(column)])
      ? editFields[String(column)]
      : [];

    return (
      <FormControl variant="outlined" fullWidth sx={formControlStyles}>
        <Select
          multiple
          value={selectedValues}
          onChange={(e) =>
            setEditField && setEditField(String(column), e.target.value)
          }
          renderValue={(selected) => {
            if (!Array.isArray(selected)) return "";
            const labels = selected.map(
              (v) => config.options?.find((opt) => opt.value === v)?.label || v
            );
            return labels.join(", ");
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

  if (config.type === "autocomplete" && config.options) {
    const selectedValue = editFields[String(column)] || "";
    const selectedOption =
      config.options?.find((opt) => opt.value === selectedValue) || null;

    return (
      <Autocomplete
        freeSolo
        value={selectedOption}
        onChange={(event, newValue) => {
          setEditField &&
            setEditField(
              String(column),
              newValue && typeof newValue !== "string" ? newValue.value : ""
            );
        }}
        inputValue={undefined}
        onInputChange={(event, newInputValue) => {
          if (!event) return;
        }}
        options={config.options || []}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label
        }
        renderInput={(params) => (
          <TextfieldComponent
            {...params}
            label={translateColumnHeaderToSpanish(column)}
            placeholder={`Buscar ${translateColumnHeaderToSpanish(column)}`}
            sx={{
              width:
                String(column) === "brand" || String(column) === "color"
                  ? "180px"
                  : "100%",
            }}
          />
        )}
      />
    );
  }

  if (config.type === "autocomplete multiple" && config.options) {
    const selectedValues: string[] = Array.isArray(editFields[String(column)])
      ? (editFields[String(column)] as string[])
      : [];
    const selectedOptions = config.options.filter((opt) =>
      selectedValues.some((val) => val === opt.value)
    );

    return (
      <Autocomplete
        multiple
        limitTags={5}
        value={selectedOptions}
        onChange={(event, newValue) => {
          setEditField &&
            setEditField(
              String(column),
              newValue.map((option) => option.value)
            );
        }}
        options={config.options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return <Typography key={key} {...tagProps}>{option.label}</Typography>;
          })
        }
        renderInput={(params) => (
          <TextfieldComponent
            {...params}
            label={translateColumnHeaderToSpanish(column)}
            fullWidth
            placeholder={`Buscar ${translateColumnHeaderToSpanish(column)}`}
          />
        )}
      />
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