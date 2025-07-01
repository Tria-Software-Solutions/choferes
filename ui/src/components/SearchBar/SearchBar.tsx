import React from "react";
import { Box, IconButton, InputBase, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { SEARCH_BAR } from "../../constants/constants";

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: unknown;
  onSearch?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = SEARCH_BAR.PLACEHOLDER,
  value,
  fullWidth,
  sx,
  onChange,
}) => {
  const theme = useTheme();

  const handleClear = () => {
    onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: theme.palette.background.paper,
        border: "2px solid",
        borderColor: theme.palette.divider,
        borderRadius: theme.shape.borderRadius,
        padding: "8px 12px",
        height: "40px",
        minHeight: "40px",
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: theme.palette.primary.main,
        },
        "&:focus-within": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
        },
        ...(typeof sx === "object" && sx !== null ? sx : {}),
      }}
    >
      {value ? (
        <IconButton
          type="button"
          aria-label="clear"
          onClick={handleClear}
          sx={{
            padding: "4px",
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            },
          }}
        >
          <ClearRoundedIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      ) : (
        <IconButton
          type="button"
          aria-label="search"
          sx={{
            padding: "4px",
            color: theme.palette.text.secondary,
          }}
        >
          <SearchIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      )}
      <InputBase
        placeholder={placeholder}
        inputProps={{ "aria-label": placeholder }}
        value={value}
        fullWidth={fullWidth}
        onChange={onChange}
        sx={{
          marginLeft: "8px",
          flex: 1,
          color: theme.palette.text.primary,
          "& input": {
            color: theme.palette.text.primary,
            fontSize: "0.875rem",
            padding: "0",
            height: "24px",
            "&::placeholder": {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;
