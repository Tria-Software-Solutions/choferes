import React from "react";
import { IconButton, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  onSearch?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  value,
  fullWidth,
  onChange,
}) => {
  const handleClear = () => {
    onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="search-bar-container">
      {value ? (
        <IconButton
          type="button"
          className="clear-button"
          aria-label="clear"
          onClick={handleClear}
        >
          <ClearRoundedIcon />
        </IconButton>
      ) : (
        <IconButton
          type="button"
          className="search-bar-icon"
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
      )}
      <InputBase
        className="search-bar-input"
        placeholder={placeholder}
        inputProps={{ "aria-label": placeholder }}
        value={value}
        fullWidth={fullWidth}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
