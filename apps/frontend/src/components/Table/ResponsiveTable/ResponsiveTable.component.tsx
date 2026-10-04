import React from "react";
import { Table, TableBody, TableHead, type TableProps, useTheme } from "@mui/material";
import { useMobileShell } from "../../../hooks/useMobileShell";

// "Acciones" no necesita etiqueta: los botones se alinean solos a la derecha.
const textOf = (node: React.ReactNode): string => {
  const text = typeof node === "string" || typeof node === "number" ? String(node) : "";
  return /^acciones?$/i.test(text.trim()) ? "" : text;
};

// Etiquetas de columna tomadas de la fila de <TableHead>.
const readHeaderLabels = (children: React.ReactNode): string[] => {
  const head = React.Children.toArray(children).find(
    (child): child is React.ReactElement => React.isValidElement(child) && child.type === TableHead,
  );
  const headRow = head && React.Children.toArray(head.props.children)[0];
  if (!React.isValidElement(headRow)) return [];
  return React.Children.toArray((headRow.props as { children?: React.ReactNode }).children).map((cell) =>
    React.isValidElement(cell) ? textOf((cell.props as { children?: React.ReactNode }).children) : "",
  );
};

// Agrega `data-label` a cada celda del cuerpo para poder mostrarla como
// "ETIQUETA  valor" cuando la fila se apila.
const labelBody = (children: React.ReactNode, labels: string[]) =>
  React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== TableBody) return child;
    const rows = React.Children.toArray(child.props.children).map((row) => {
      if (!React.isValidElement(row)) return row;
      const cells = React.Children.toArray((row.props as { children?: React.ReactNode }).children).map(
        (cell, index) =>
          React.isValidElement(cell) ? React.cloneElement(cell as React.ReactElement<Record<string, unknown>>, { "data-label": labels[index] ?? "" }) : cell,
      );
      return React.cloneElement(row as React.ReactElement<Record<string, unknown>>, {}, cells);
    });
    return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {}, rows);
  });

// <Table> de MUI que en teléfonos y tablets apila cada fila como una tarjeta
// ("ETIQUETA · valor") en lugar de obligar a hacer scroll horizontal. En
// escritorio es exactamente un <Table>.
const ResponsiveTable: React.FC<TableProps> = ({ children, sx, ...props }) => {
  const isMobileShell = useMobileShell();
  const { colors, borders } = useTheme().tokens;

  if (!isMobileShell) {
    return (
      <Table sx={sx} {...props}>
        {children}
      </Table>
    );
  }

  const labels = readHeaderLabels(children);
  return (
    <Table
      {...props}
      sx={[
        {
          display: "block",
          "& thead": { display: "none" },
          "& tbody": { display: "block" },
          "& tbody tr": {
            display: "block",
            px: 2,
            py: 1.25,
            borderBottom: borders.hairline,
            "&:last-of-type": { borderBottom: "none" },
          },
          "& tbody td": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            border: "none",
            px: 0,
            py: 0.625,
            textAlign: "right",
            whiteSpace: "normal !important",
            "&::before": {
              content: "attr(data-label)",
              flexShrink: 0,
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: colors.textMuted,
              textAlign: "left",
            },
            // Celdas sin etiqueta (p. ej. acciones): ocupan toda la fila.
            '&[data-label=""]': { justifyContent: "flex-end", "&::before": { display: "none" } },
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {labelBody(children, labels)}
    </Table>
  );
};

export default ResponsiveTable;
