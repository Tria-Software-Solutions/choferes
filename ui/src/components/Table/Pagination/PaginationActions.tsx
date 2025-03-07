import { IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import React from "react";

interface PaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
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

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        whiteSpace: "nowrap",
        padding: "10px"
      }}
    >
      <span style={{ minWidth: "80px", textAlign: "center" }}>
        Página {page + 1}
      </span>
      <IconButton
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
        aria-label="Página anterior"
      >
        <ArrowBack />
      </IconButton>
      <span style={{ minWidth: "80px", textAlign: "center" }}>
        {startIndex}-{endIndex} de {count}
      </span>
      <IconButton
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="Página siguiente"
      >
        <ArrowForward />
      </IconButton>
    </div>
  );
};

export default PaginationActions;
