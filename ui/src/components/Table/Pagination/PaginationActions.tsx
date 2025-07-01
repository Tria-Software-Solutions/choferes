import { IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import React from "react";
import { PAGINATION } from "../../../constants/constants";

interface PaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
}

const PaginationActions: React.FC<PaginationActionsProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
}) => {
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, count);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        whiteSpace: "nowrap",
        padding: isSmallScreen ? "0" : "10px",
      }}
    >
      {!isSmallScreen && (
        <Typography
          variant="body2"
          style={{ minWidth: "80px", textAlign: "center" }}
        >
          {PAGINATION.PAGE} {page + 1}
        </Typography>
      )}
      <IconButton
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
        aria-label={PAGINATION.PREVIOUS}
      >
        <ArrowBack />
      </IconButton>
      <Typography
        variant="body2"
        style={{ minWidth: "80px", textAlign: "center" }}
      >
        {startIndex}-{endIndex} {PAGINATION.OF} {count}
      </Typography>
      <IconButton
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={PAGINATION.NEXT}
      >
        <ArrowForward />
      </IconButton>
    </div>
  );
};

export default PaginationActions;
