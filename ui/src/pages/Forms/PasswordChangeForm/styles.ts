import { Theme } from "@mui/material/styles";
import { CSSProperties } from "react";

export const formBox = {
  width: "100%",
};

export const subtitle = {
  mb: 3,
};

export const temporalPasswordBox = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mt: 1,
  width: "100%",
};

export const generateButton = {
  mt: 1,
};

export const iconStyle: CSSProperties = {
  color: "#666666",
};

export const infoBox = (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  p: { xs: 1.5, sm: 2 },
  backgroundColor: theme.palette.action.hover,
  borderRadius: 1,
  border: "1px solid",
  borderColor: theme.palette.divider,
});
