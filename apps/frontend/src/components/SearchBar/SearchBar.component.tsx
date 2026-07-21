import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { Search, X } from "lucide-react";
import { SEARCH_BAR } from "../../constants/constants";
import {
  textFieldStyles,
  searchIconStyles,
  clearIconStyles,
} from "./SearchBar.styles";

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: object;
  onSearch?: () => void;
  size?: "small" | "medium";
  margin?: "none" | "dense" | "normal";
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  isSearching?: boolean;
}

// SearchBar component provides a styled input for searching with clear and search icons.
// Props:
// - value: current input value
// - onChange: handler for input changes
// - placeholder: placeholder text
// - fullWidth: whether the input should take full width
// - sx: custom styles
// - onSearch: optional search handler
// - isSearching: shows a spinner in the end adornment during server-side search
const SearchBarComponent: React.FC<SearchBarProps> = ({
  placeholder = SEARCH_BAR.PLACEHOLDER,
  value,
  fullWidth,
  sx,
  onChange,
  onSearch,
  size = "medium",
  margin = "none",
  onKeyDown,
  onClick,
  isSearching = false,
}) => {
  const handleClear = () => {
    // Clear the input by setting its value to an empty string
    onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <TextField
      data-testid="search-bar-wrapper"
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      sx={textFieldStyles(sx)}
      size={size}
      margin={margin}
      InputProps={{
        startAdornment: isSearching ? (
          <InputAdornment position="start">
            <CircularProgress size={18} thickness={4} sx={{ color: "text.secondary" }} />
          </InputAdornment>
        ) : (
          <InputAdornment position="start">
            <Search size={20} style={searchIconStyles} />
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
              <X size={18} style={clearIconStyles} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      inputProps={{ "aria-label": placeholder }}
      onKeyDown={onKeyDown}
      onClick={onClick}
    />
  );
};

export default React.memo(SearchBarComponent);
