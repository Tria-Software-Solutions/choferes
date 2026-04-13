import type { Theme } from "@mui/material";

export const getTableFooterStyles = (theme: Theme) => ({
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: "8px 16px",
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  periodInfo: {
    ml: 2,
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
  },
  pagination: {
    color: theme.palette.text.primary,
    ".MuiTablePagination-toolbar": {
      backgroundColor: "transparent",
      padding: 0,
      minHeight: "40px",
      border: "none",
    },
    ".MuiTablePagination-selectLabel, .MuiTablePagination-input, .MuiTablePagination-displayedRows": {
      color: theme.palette.text.primary,
      fontSize: "0.75rem",
    },
    ".MuiTablePagination-selectLabel": {
      fontSize: "0.75rem",
    },
    ".MuiInputBase-root": {
      fontSize: "0.75rem",
      border: "none",
      "&:before, &:after": {
        display: "none",
      },
    },
    ".MuiTablePagination-input": {
      fontSize: "0.75rem",
    },
    ".MuiTablePagination-select": {
      fontSize: "0.75rem",
      border: "none",
    },
    ".MuiTablePagination-selectIcon": {
      fontSize: "1rem",
    },
    ".MuiSvgIcon-root": {
      color: theme.palette.text.primary,
    },
  },
});
