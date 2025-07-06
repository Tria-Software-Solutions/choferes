import React from "react";
import { Grid } from "@mui/material";
import { ColumnConfigType } from "./tableConfig";

export const wrapWithGrid = <T extends object>(
  component: React.ReactNode,
  column: keyof T,
  columnConfig: Record<string, ColumnConfigType>
) => {
  const config = columnConfig[String(column)];
  if (!config?.size) {
    return component;
  }

  return (
    <Grid
      item
      xs={config.size.xs}
      sm={config.size.sm}
      md={config.size.md}
      lg={config.size.lg}
    >
      {component}
    </Grid>
  );
};

export const shouldRenderParkingDateColumn = <T extends object>(
  editRowId: number | null,
  data: T[]
): boolean => {
  return editRowId !== null && data.length > 0 && "licensePlate" in data[0];
};

export const isVehicleTable = <T extends object>(data: T[]): boolean => {
  return data.length > 0 && "licensePlate" in data[0];
}; 