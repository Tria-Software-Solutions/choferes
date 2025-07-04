import { SxProps, Theme } from "@mui/material";

export const buttonGroupStyles: SxProps<Theme> = {
  height: "56px",
};

export const popperStyles: SxProps<Theme> = {
  zIndex: 2,
};

export const growStyles = (placement: string): React.CSSProperties => ({
  transformOrigin: placement === "bottom" ? "center top" : "center bottom",
});

export const menuIconSpanStyles: React.CSSProperties = {
  marginRight: 8,
}; 