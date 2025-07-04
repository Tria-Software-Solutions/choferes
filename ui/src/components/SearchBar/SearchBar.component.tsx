import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { SEARCH_BAR } from "../../constants/constants";
import { textFieldStyles, searchIconStyles, clearIconStyles } from "./SearchBar.styles";

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: object;
  onSearch?: () => void;
}

// SearchBar component provides a styled input for searching with clear and search icons.
// Props:
// - value: current input value
// - onChange: handler for input changes
// - placeholder: placeholder text
// - fullWidth: whether the input should take full width
// - sx: custom styles
// - onSearch: optional search handler
const SearchBarComponent: React.FC<SearchBarProps> = ({
  placeholder = SEARCH_BAR.PLACEHOLDER,
  value,
  fullWidth,
  sx,
  onChange,
  onSearch,
}) => {
  const handleClear = () => {
    // Clear the input by setting its value to an empty string
    onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <TextField
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      sx={textFieldStyles(sx)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={searchIconStyles} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              aria-label="clear"
              onClick={handleClear}
              edge="end"
              size="small"
            >
              <ClearRoundedIcon sx={clearIconStyles} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      inputProps={{ "aria-label": placeholder }}
      onKeyDown={onSearch ? (e) => {
        if (e.key === "Enter") onSearch();
      } : undefined}
    />
  );
};

export default SearchBarComponent;
