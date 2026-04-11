import { IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";
import { PAGINATION } from "../../../constants/constants";
import { containerStyles, pageTextStyles } from "./Pagination.styles";

// PaginationActions component provides custom pagination controls for tables, including page navigation and item range display.
// Props:
// - count: total number of items
// - page: current page index
// - rowsPerPage: number of items per page
// - onPageChange: handler for page changes

interface PaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
}

const PaginationComponent: React.FC<PaginationActionsProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
}) => {
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, count);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Responsive check for small screens

  return (
    <div style={containerStyles(isSmallScreen)}>
      {!isSmallScreen && (
        <Typography
          variant="body2"
          style={{ ...pageTextStyles, color: theme.palette.text.primary }}
        >
          {PAGINATION.PAGE} {page + 1}
        </Typography>
      )}
      <IconButton
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
        aria-label={PAGINATION.PREVIOUS}
      >
        <ArrowLeft
          style={{
            color:
              theme.palette.mode === "dark"
                ? theme.palette.primary.main
                : "#000000",
          }}
        />
      </IconButton>
      <Typography variant="body2" style={pageTextStyles}>
        <span style={{ color: theme.palette.text.primary }}>
          {startIndex}-{endIndex} {PAGINATION.OF} {count}
        </span>
      </Typography>
      <IconButton
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={PAGINATION.NEXT}
      >
        <ArrowRight
          style={{
            color:
              theme.palette.mode === "dark"
                ? theme.palette.primary.main
                : "#000000",
          }}
        />
      </IconButton>
    </div>
  );
};

export default PaginationComponent;
