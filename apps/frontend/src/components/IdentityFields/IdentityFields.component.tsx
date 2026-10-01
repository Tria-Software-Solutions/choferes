import React from "react";
import { Box, Grid, MenuItem } from "@mui/material";
import { IconId, IconWorld } from "@tabler/icons-react";
import {
  COUNTRY_CODES,
  NATIONAL_ID_MAX_LENGTH,
  NATIONAL_ID_TYPES,
  NATIONAL_ID_TYPE_LABELS,
  NationalIdType,
  getCountryName,
  getFlagEmoji,
  normalizeNationalId,
  nationalityForIdType,
  validateNationalId,
  formatNationalId,
} from "@choferes/shared";
import TextfieldComponent from "../Textfield/Textfield.component";
import PlaceholderSelect from "../PlaceholderSelect/PlaceholderSelect.component";

export interface IdentityValue {
  nationalIdType: NationalIdType;
  /** Lo que se ve en el campo (la cédula con guiones). */
  nationalId: string;
  nationality: string;
}

interface IdentityFieldsProps {
  value: IdentityValue;
  onChange: (value: IdentityValue) => void;
  disabled?: boolean;
  iconColor?: string;
}

const PLACEHOLDERS: Record<NationalIdType, string> = {
  cedula: "Ej: 1-2345-6789",
  dimex: "11 o 12 dígitos",
  pasaporte: "Ej: AB123456",
  otro: "Número del documento",
};

/** Bandera + nombre: "🇨🇷 Costa Rica". */
export const countryLabel = (code: string): string =>
  `${getFlagEmoji(code)} ${getCountryName(code) ?? code}`.trim();

/** Error del documento tal como está escrito en el campo. */
export const identityError = (value: IdentityValue): string =>
  validateNationalId(
    value.nationalIdType,
    normalizeNationalId(value.nationalIdType, value.nationalId),
  );

// Documento de identidad con tipo y nacionalidad. La cédula es costarricense; los
// extranjeros pueden tener DIMEX, pasaporte u otro documento (más largos y con
// letras), y la bandera del país elegido aparece junto al número.
const IdentityFields: React.FC<IdentityFieldsProps> = ({
  value,
  onChange,
  disabled,
  iconColor,
}) => {
  const error = identityError(value);
  const isCedula = value.nationalIdType === "cedula";
  const flag = getFlagEmoji(value.nationality);

  const handleTypeChange = (type: NationalIdType) => {
    const normalized = normalizeNationalId(type, value.nationalId);
    onChange({
      nationalIdType: type,
      nationality: nationalityForIdType(type, value.nationality),
      nationalId: formatNationalId(type, normalized),
    });
  };

  const handleNumberChange = (raw: string) => {
    const normalized = normalizeNationalId(value.nationalIdType, raw);
    onChange({ ...value, nationalId: formatNationalId(value.nationalIdType, normalized) });
  };

  return (
    <>
      <Grid item xs={12} sm={6}>
        <PlaceholderSelect<NationalIdType>
          label="Tipo de documento"
          placeholder="Selecciona"
          icon={<IconId size={20} color={iconColor} />}
          value={value.nationalIdType}
          disabled={disabled}
          formatValue={(type) => NATIONAL_ID_TYPE_LABELS[type]}
          onChange={(event) => handleTypeChange(event.target.value as NationalIdType)}
        >
          {NATIONAL_ID_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {NATIONAL_ID_TYPE_LABELS[type]}
            </MenuItem>
          ))}
        </PlaceholderSelect>
      </Grid>
      <Grid item xs={12} sm={6}>
        <PlaceholderSelect<string>
          label="Nacionalidad"
          placeholder="Selecciona"
          icon={<IconWorld size={20} color={iconColor} />}
          value={value.nationality}
          // La cédula es costarricense: el país queda fijo.
          disabled={disabled || isCedula}
          formatValue={countryLabel}
          onChange={(event) => onChange({ ...value, nationality: String(event.target.value) })}
        >
          {COUNTRY_CODES.map((code) => (
            <MenuItem key={code} value={code}>
              {countryLabel(code)}
            </MenuItem>
          ))}
        </PlaceholderSelect>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextfieldComponent
          name="nationalId"
          label={NATIONAL_ID_TYPE_LABELS[value.nationalIdType].split(" (")[0]}
          placeholder={PLACEHOLDERS[value.nationalIdType]}
          icon={
            flag ? (
              <Box component="span" aria-hidden sx={{ fontSize: "1.1rem", lineHeight: 1 }}>
                {flag}
              </Box>
            ) : (
              <IconId size={20} color={iconColor} />
            )
          }
          value={value.nationalId}
          onChange={(event) => handleNumberChange(event.target.value)}
          disabled={disabled}
          error={error !== ""}
          helperText={error || undefined}
          inputProps={{
            inputMode: value.nationalIdType === "cedula" || value.nationalIdType === "dimex" ? "numeric" : "text",
            maxLength: NATIONAL_ID_MAX_LENGTH[value.nationalIdType] + (isCedula ? 2 : 0),
            style: value.nationalIdType === "pasaporte" || value.nationalIdType === "otro" ? { textTransform: "uppercase" } : undefined,
          }}
        />
      </Grid>
    </>
  );
};

export default IdentityFields;
